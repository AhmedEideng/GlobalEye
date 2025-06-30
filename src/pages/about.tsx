import React from 'react';
import type { GetServerSideProps } from 'next';
import AboutPage from '../app/about/page';

export default function About(props: any) {
  return <AboutPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
}; 