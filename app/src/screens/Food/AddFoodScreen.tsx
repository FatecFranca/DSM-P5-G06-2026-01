import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Search, Check, X } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import { FoodItem, MealType, RootStackParamList } from '../../types';
import { getFoodCategoryColor, getFoodCategoryLabel, getMealTypeLabel } from '../../utils/helpers';
import { apiBuscarAlimentos, type ApiAlimento } from '../../services/api';

type Route = RouteProp<RootStackParamList, 'AddFood'>;

function apiAlimentoToFoodItem(a: ApiAlimento): FoodItem {
  const catMap: Record<string, FoodItem['category']> = {
    bom: 'good', moderado: 'moderate', ruim: 'bad',
  };
  return {
    id:            a.fatsecretId ?? a.id,
    name:          a.marca ? `${a.nome} (${a.marca})` : a.nome,
    calories:      Math.round(a.calorias),
    carbs:         Math.round(a.carboidratos * 10) / 10,
    protein:       Math.round(a.proteinas * 10) / 10,
    fat:           Math.round(a.gorduras * 10) / 10,
    category:      catMap[a.categoria] ?? 'moderate',
    portion:       a.porcao,
    glycemicIndex: a.indiceGlicemico,
  };
}

export default function AddFoodScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { addMeal } = useApp();
  const { mealType, date } = route.params;

  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<FoodItem[]>([]);
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [searching, setSearching]   = useState(false);
  const [fatResults, setFatResults] = useState<FoodItem[]>([]);
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced FatSecret search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 2) {
      setFatResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await apiBuscarAlimentos(search.trim(), 0, 20);
        setFatResults(result.alimentos.map(apiAlimentoToFoodItem));
      } catch {
        setFatResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // When no active search, show local database filtered by category
  const [activeCategory, setActiveCategory] = useState<'all' | 'good' | 'moderate' | 'bad'>('all');

  const localFiltered = useMemo(() => {
    if (search.trim().length >= 2) return [];
    return FOOD_DATABASE.filter(f => {
      const matchCat = activeCategory === 'all' || f.category === activeCategory;
      return matchCat;
    });
  }, [search, activeCategory]);

  const displayList: FoodItem[] = search.trim().length >= 2 ? fatResults : localFiltered;
  const isSearchMode = search.trim().length >= 2;

  const toggleFood = (food: FoodItem) => {
    setSelected(prev =>
      prev.find(f => f.id === food.id)
        ? prev.filter(f => f.id !== food.id)
        : [...prev, food],
    );
  };

  const isSelected = (id: string) => selected.some(f => f.id === id);

  const totalCal  = selected.reduce((s, f) => s + f.calories, 0);
  const totalCarb = selected.reduce((s, f) => s + f.carbs, 0);
  const totalProt = selected.reduce((s, f) => s + f.protein, 0);
  const totalFat  = selected.reduce((s, f) => s + f.fat, 0);

  const handleSave = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await addMeal({
        type:          mealType,
        date,
        time:          new Date().toTimeString().slice(0, 5),
        foods:         selected,
        totalCalories: totalCal,
        totalCarbs:    totalCarb,
        notes:         notes.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      // silently ignore — user stays on screen
    } finally {
      setLoading(false);
    }
  };

  const cats: Array<{ key: typeof activeCategory; label: string }> = [
    { key: 'all',      label: 'Todos' },
    { key: 'good',     label: 'Saudável' },
    { key: 'moderate', label: 'Moderado' },
    { key: 'bad',      label: 'Evitar' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title={`Adicionar — ${getMealTypeLabel(mealType)}`} subtitle={date} />

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar alimento (FatSecret)..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {searching && <ActivityIndicator size="small" color={Colors.primary} />}
          {search.length > 0 && !searching && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        {isSearchMode && (
          <Text style={styles.searchHint}>
            {searching ? 'Buscando...' : `${fatResults.length} resultado(s) encontrado(s)`}
          </Text>
        )}
      </View>

      {/* Category filter — only when not in search mode */}
      {!isSearchMode && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar} contentContainerStyle={styles.catBarContent}>
          {cats.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catBtn, activeCategory === c.key && styles.catBtnActive]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Text style={[styles.catText, activeCategory === c.key && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Selected summary */}
        {selected.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{selected.length} alimento(s) selecionado(s)</Text>
            <View style={styles.macroRow}>
              {[
                { label: 'Calorias', value: `${totalCal} kcal`, color: Colors.orange },
                { label: 'Carbs',    value: `${totalCarb}g`,    color: Colors.warning },
                { label: 'Prot.',    value: `${totalProt}g`,    color: Colors.primary },
                { label: 'Gord.',    value: `${totalFat}g`,     color: Colors.secondary },
              ].map(m => (
                <View key={m.label} style={styles.macroItem}>
                  <Text style={[styles.macroVal, { color: m.color }]}>{m.value}</Text>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chips}>
              {selected.map(f => (
                <TouchableOpacity key={f.id} style={styles.chip} onPress={() => toggleFood(f)}>
                  <Text style={styles.chipText} numberOfLines={1}>{f.name}</Text>
                  <X size={10} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Food list */}
        <View style={styles.foodList}>
          {displayList.map(food => {
            const sel = isSelected(food.id);
            const catColor = getFoodCategoryColor(food.category);
            return (
              <TouchableOpacity key={food.id} onPress={() => toggleFood(food)} activeOpacity={0.7}>
                <Card style={[styles.foodCard, sel ? styles.foodCardSelected : undefined] as any} padding={12}>
                  <View style={styles.foodRow}>
                    <View style={[styles.categoryTag, { backgroundColor: catColor + '20' }]}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                    </View>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodPortion}>{food.portion}</Text>
                      {food.glycemicIndex !== undefined && (
                        <Text style={styles.giLabel}>IG: {food.glycemicIndex}</Text>
                      )}
                    </View>
                    <View style={styles.foodMacros}>
                      <Text style={styles.foodCal}>{food.calories} kcal</Text>
                      <Text style={styles.foodCarb}>{food.carbs}g carbs</Text>
                    </View>
                    <View style={[styles.checkCircle, sel && styles.checkCircleActive]}>
                      {sel && <Check size={14} color="#fff" />}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}

          {isSearchMode && !searching && fatResults.length === 0 && (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>Nenhum alimento encontrado para "{search}"</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.notesWrap}>
          <Text style={styles.notesLabel}>Observações</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: sem sal, porção dobrada..."
            placeholderTextColor={Colors.textLight}
            multiline
          />
        </View>

        <View style={styles.actions}>
          <Button
            title={`Salvar Refeição (${selected.length})`}
            onPress={handleSave}
            loading={loading}
            disabled={selected.length === 0}
          />
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 8, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  searchHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 6, marginLeft: 4 },
  catBar: { backgroundColor: Colors.card, maxHeight: 50 },
  catBarContent: { paddingHorizontal: Spacing.lg, paddingVertical: 8, gap: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catTextActive: { color: '#fff' },
  summaryCard: { margin: Spacing.lg, marginBottom: Spacing.md },
  summaryTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  macroItem: { alignItems: 'center' },
  macroVal: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold },
  macroLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  chipText: { fontSize: FontSize.xs, color: Colors.primary, maxWidth: 100 },
  foodList: { paddingHorizontal: Spacing.lg, gap: 8 },
  foodCard: { marginBottom: 0 },
  foodCardSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryTag: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  foodPortion: { fontSize: FontSize.xs, color: Colors.textSecondary },
  giLabel: { fontSize: FontSize.xs, color: Colors.secondary, marginTop: 1 },
  foodMacros: { alignItems: 'flex-end' },
  foodCal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  foodCarb: { fontSize: FontSize.xs, color: Colors.textSecondary },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  emptySearch: { paddingVertical: 24, alignItems: 'center' },
  emptySearchText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  notesWrap: { margin: Spacing.lg },
  notesLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  notesInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, minHeight: 70, textAlignVertical: 'top' },
  actions: { paddingHorizontal: Spacing.lg },
});
