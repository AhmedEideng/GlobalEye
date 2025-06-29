import SearchClient from "../components/SearchClient";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : Array.isArray(params.q) ? params.q[0] : "";
  
  return <SearchClient query={query} />;
}