import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

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

  const [itemsCount, setItemsCount] = useState(initialItemsCount);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Recomeça a paginação quando a lista base muda de tamanho
  useEffect(() => {
    setItemsCount(initialItemsCount);
  }, [allItems.length, initialItemsCount]);

  const displayedItems = useMemo(
    () => allItems.slice(0, itemsCount),
    [allItems, itemsCount]
  );

  const hasMore = itemsCount < allItems.length;

  // Função para carregar mais itens
  const loadMore = useCallback(() => {
    setItemsCount((current) => {
      const nextCount = current + itemsPerPage;
      return nextCount >= allItems.length ? allItems.length : nextCount;
    });
  }, [allItems.length, itemsPerPage]);

  // Observer para detectar quando chegar ao final
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!hasMore) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
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
