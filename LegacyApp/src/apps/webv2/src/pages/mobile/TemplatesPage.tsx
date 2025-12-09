import { Page, Navbar, Block, List, ListItem, Searchbar } from 'framework7-react';
import { Plus } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <Page name="templates">
      <Navbar title="Practice Templates" backLink="Back" />

      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title"
        placeholder="Search templates..."
      />

      <Block className="!mt-4 flex justify-end">
        <a href="#" className="flex items-center gap-1 text-primary-500 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Template
        </a>
      </Block>

      <List className="search-list" mediaList inset>
        <ListItem
          title="Standard Practice"
          subtitle="2 hours • 5 periods"
          text="Regular team practice session"
        />
        <ListItem
          title="Game Day Warm Up"
          subtitle="45 min • 3 periods"
          text="Pre-game preparation routine"
        />
        <ListItem
          title="Skills Focus"
          subtitle="1.5 hours • 4 periods"
          text="Individual skill development session"
        />
      </List>
    </Page>
  );
}
