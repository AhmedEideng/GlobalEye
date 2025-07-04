import SearchClient from "../components/SearchClient";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : Array.isArray(searchParams.q) ? searchParams.q[0] : "";
  
  return <SearchClient query={query} />;
}

export const revalidate = 120;