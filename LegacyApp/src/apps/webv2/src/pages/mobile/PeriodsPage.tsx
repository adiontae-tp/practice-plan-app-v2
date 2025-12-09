import { Page, Navbar, Block, List, ListItem, Searchbar } from 'framework7-react';
import { Plus } from 'lucide-react';

export default function PeriodsPage() {
  return (
    <Page name="periods">
      <Navbar title="Period Templates" backLink="Back" />

      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title"
        placeholder="Search periods..."
      />

      <Block className="!mt-4 flex justify-end">
        <a href="#" className="flex items-center gap-1 text-primary-500 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Period
        </a>
      </Block>

      <List className="search-list" mediaList inset>
        <ListItem
          title="Warm Up"
          subtitle="15 min"
          text="Dynamic stretching and light cardio"
        />
        <ListItem
          title="Skill Work"
          subtitle="20 min"
          text="Individual skill development"
        />
        <ListItem
          title="Team Drills"
          subtitle="30 min"
          text="Team-based practice activities"
        />
        <ListItem
          title="Scrimmage"
          subtitle="25 min"
          text="Game simulation"
        />
        <ListItem
          title="Cool Down"
          subtitle="10 min"
          text="Static stretching and recovery"
        />
      </List>
    </Page>
  );
}
