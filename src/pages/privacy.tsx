import React from 'react';
import type { GetServerSideProps } from 'next';
import PrivacyPage from '../app/privacy/page';

export default function Privacy(props: any) {
  return <PrivacyPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
}; 