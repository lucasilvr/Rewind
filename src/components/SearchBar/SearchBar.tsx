"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SearchIcon } from "@/components/icons/icons";
import styles from "./SearchBar.module.css";

export const SEARCH_PATH = "/busca";

interface SearchFormProps {
  initialQuery: string;
}

function SearchForm({ initialQuery }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    // Busca vazia também vai para a tela de busca, que mostra a orientação.
    router.push(term ? `${SEARCH_PATH}?q=${encodeURIComponent(term)}` : SEARCH_PATH);
  };

  return (
    <form role="search" className={styles.search} onSubmit={handleSubmit}>
      <SearchIcon size={20} />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={styles.input}
        placeholder="Procure por artistas, álbuns e mais..."
        aria-label="Buscar álbuns por nome ou artista"
        autoComplete="off"
      />
    </form>
  );
}

/** Na tela de busca, o campo mostra o termo atual da URL. */
function SearchFormWithCurrentQuery() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = pathname === SEARCH_PATH ? (searchParams.get("q") ?? "") : "";

  // A key recria o formulário quando o termo da URL muda (ex.: voltar no navegador).
  return <SearchForm key={currentQuery} initialQuery={currentQuery} />;
}

// useSearchParams exige um Suspense em volta; o fallback é o mesmo campo, vazio.
export function SearchBar() {
  return (
    <Suspense fallback={<SearchForm initialQuery="" />}>
      <SearchFormWithCurrentQuery />
    </Suspense>
  );
}
