import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  initialItemsCount?: number;
  itemsPerPage?: number;
}

export function useInfiniteScroll<T>(
  allItems: T[],
  options: UseInfiniteScrollOptions = {}
) {
  const {
    initialItemsCount = 20, // Quantidade inicial para preencher tela grande
    itemsPerPage = 10, // Itens carregados por scroll
  } = options;

  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Inicializa com os primeiros itens
  useEffect(() => {
    const initialCount = Math.max(initialItemsCount, displayedItems.length);
    const next = allItems.slice(0, initialCount);
    setDisplayedItems(next);
    setHasMore(allItems.length > next.length);
  }, [allItems, initialItemsCount]);

  // Função para carregar mais itens
  const loadMore = useCallback(() => {
    const currentLength = displayedItems.length;
    const nextItems = allItems.slice(0, currentLength + itemsPerPage);
    setDisplayedItems(nextItems);
    setHasMore(nextItems.length < allItems.length);
  }, [allItems, displayedItems.length, itemsPerPage]);

  // Observer para detectar quando chegar ao final
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMore]);

  return {
    displayedItems,
    hasMore,
    loadMoreRef,
  };
}
