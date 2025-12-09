import { Page, Navbar, Block, List, ListItem, Searchbar } from 'framework7-react';

export default function CoachesPage() {
  return (
    <Page name="coaches">
      <Navbar title="Coaches" backLink="Back" />

      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title"
        placeholder="Search coaches..."
      />

      <Block className="!mt-4 flex justify-end">
        <a href="#" className="flex items-center gap-1 text-primary-500 text-sm font-medium">
          + Invite Coach
        </a>
      </Block>

      <List className="search-list" mediaList inset strong>
        <ListItem
          title="John Smith"
          subtitle="Head Coach"
          after="Active"
        />
        <ListItem
          title="Jane Doe"
          subtitle="Assistant Coach"
          after="Active"
        />
        <ListItem
          title="Mike Johnson"
          subtitle="Position Coach"
          after="Pending"
        />
      </List>
    </Page>
  );
}
