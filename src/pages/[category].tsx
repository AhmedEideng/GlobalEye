import React from 'react';
import type { GetServerSideProps } from 'next';
import CategoryPage from '../app/[category]/page';

export default function Category(props: any) {
  return <CategoryPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category } = context.params || {};
  return { props: { category } };
}; 