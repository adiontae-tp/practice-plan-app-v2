import { Page, Navbar, Block, Button } from 'framework7-react';

export default function NotFoundPage() {
  return (
    <Page name="not-found">
      <Navbar title="Not Found" backLink="Back" />

      <Block className="text-center !mt-12">
        <p className="text-6xl mb-4">404</p>
        <p className="text-xl text-typography-600 mb-6">Page not found</p>
        <Button fill href="/">
          Go Home
        </Button>
      </Block>
    </Page>
  );
}
