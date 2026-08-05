import { Ionicons } from '@expo/vector-icons';
import { fetchArticles } from '@read-later/shared';
import type { Article } from '@read-later/shared';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import type { FeedStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<FeedStackParamList, 'FeedList'>;

function ArticleCard({
  article,
  onPress,
  onBookmark,
  saved,
  isToggling,
}: {
  article: Article;
  onPress: () => void;
  onBookmark: () => void;
  saved: boolean;
  isToggling: boolean;
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
      <TouchableOpacity onPress={onBookmark} style={styles.bookmarkBtn} hitSlop={8} disabled={isToggling}>
        {isToggling ? (
          <ActivityIndicator size="small" color="#0066cc" />
        ) : (
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? '#0066cc' : '#888'}
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function FeedScreen({ navigation }: Props) {
  const [articles, setArticles] = useState<Article[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const { isSaved, toggle } = useReadLater();

  const handleToggle = async (articleId: string) => {
    setTogglingId(articleId);
    await toggle(articleId);
    setTogglingId(null);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error || !articles) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load articles</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ArticleCard
          article={item}
          saved={isSaved(item.id)}
          onPress={() => navigation.navigate('Article', { article: item })}
          isToggling={togglingId === item.id}
          onBookmark={() => handleToggle(item.id)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#c00', fontSize: 15 },
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
  bookmarkBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
});
