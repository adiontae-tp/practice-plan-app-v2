import { Page, Navbar, Block, List, ListItem, Searchbar } from 'framework7-react';

export default function TagsPage() {
  return (
    <Page name="tags">
      <Navbar title="Tags" backLink="Back" />

      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title"
        placeholder="Search tags..."
      />

      <Block className="!mt-4 flex justify-end">
        <a href="#" className="flex items-center gap-1 text-primary-500 text-sm font-medium">
          + Add Tag
        </a>
      </Block>

      <List className="search-list" inset strong>
        <ListItem title="Offense" />
        <ListItem title="Defense" />
        <ListItem title="Conditioning" />
        <ListItem title="Special Teams" />
        <ListItem title="Film Study" />
      </List>
    </Page>
  );
}
