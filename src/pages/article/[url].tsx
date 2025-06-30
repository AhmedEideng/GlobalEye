import React from 'react';
import type { GetServerSideProps } from 'next';
import ArticlePage from '../../app/article/[url]/page';

export default function Article(props: any) {
  return <ArticlePage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { url } = context.params || {};
  return { props: { url } };
}; 