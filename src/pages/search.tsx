import React from 'react';
import type { GetServerSideProps } from 'next';
import SearchPage from '../app/search/page';

export default function Search(props: any) {
  return <SearchPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
}; 