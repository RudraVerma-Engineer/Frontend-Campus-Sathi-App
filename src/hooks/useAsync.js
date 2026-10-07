import { useCallback, useEffect, useRef, useState } from "react";

// Runs an async loader on mount and exposes { data, loading, refreshing, error, reload, refresh }.
// `loader` may change identity every render; the latest one is always used.
export default function useAsync(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const alive = useRef(true);

  const run = useCallback(async (mode) => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      if (alive.current) setData(result);
    } catch (e) {
      if (alive.current) setError(e.message || "Something went wrong");
    } finally {
      if (alive.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    run("load");
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    refreshing,
    error,
    reload: () => run("load"),
    refresh: () => run("refresh"),
    setData,
  };
}
