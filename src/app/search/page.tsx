import SearchClient from "../components/SearchClient";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : "";
  
  return <SearchClient query={query} />;
}

export const revalidate = 120;