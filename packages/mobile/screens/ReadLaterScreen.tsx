import { Ionicons } from '@expo/vector-icons';
import { fetchArticles } from '@read-later/shared';
import type { Article } from '@read-later/shared';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useReadLater } from '@read-later/shared';
import type { FeedStackParamList, RootTabParamList } from '../types/navigation';

type ReadLaterNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'ReadLater'>,
  NativeStackNavigationProp<FeedStackParamList>
>;

function SavedArticleCard({
  article,
  onPress,
  onRemove,
}: {
  article: Article;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.section}>{article.section.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {article.summary}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
        <Ionicons name="bookmark" size={22} color="#0066cc" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function ReadLaterScreen() {
  const navigation = useNavigation<ReadLaterNavProp>();
  const [articles, setArticles] = useState<Article[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .finally(() => setIsLoading(false));
  }, []);

  const { savedIds, toggle } = useReadLater();

  const savedArticles = articles?.filter((a) => savedIds.has(a.id)) ?? [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (savedArticles.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="bookmark-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>Nothing saved yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the bookmark icon on any article to save it here.
        </Text>
      </View>
    );
  }

  const handleArticlePress = (article: Article) => {
    navigation.navigate('Feed', { screen: 'Article', params: { article } });
  };

  return (
    <FlatList
      data={savedArticles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SavedArticleCard
          article={item}
          onPress={() => handleArticlePress(item)}
          onRemove={() => toggle(item.id)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: '100%', height: 180 },
  cardBody: { padding: 12, paddingBottom: 8 },
  section: { fontSize: 11, fontWeight: '700', color: '#0066cc', letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '700', color: '#111', lineHeight: 23, marginBottom: 6 },
  summary: { fontSize: 14, color: '#555', lineHeight: 20 },
  removeBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
});
