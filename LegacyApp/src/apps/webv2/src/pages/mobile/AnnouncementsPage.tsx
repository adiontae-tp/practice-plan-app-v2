import { Page, Navbar, Block, List, ListItem, Searchbar } from 'framework7-react';

export default function AnnouncementsPage() {
  return (
    <Page name="announcements">
      <Navbar title="Announcements" backLink="Back" />

      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title"
        placeholder="Search announcements..."
      />

      <Block className="!mt-4 flex justify-end">
        <a href="#" className="flex items-center gap-1 text-primary-500 text-sm font-medium">
          + New Announcement
        </a>
      </Block>

      <List className="search-list" mediaList inset strong>
        <ListItem
          title="Practice Schedule Change"
          subtitle="Today at 9:00 AM"
          text="Tomorrow's practice has been moved to 3:00 PM due to field maintenance."
        />
        <ListItem
          title="Game Day Reminder"
          subtitle="Yesterday at 2:00 PM"
          text="Don't forget to arrive 2 hours early for Saturday's game."
        />
        <ListItem
          title="New Playbook Available"
          subtitle="3 days ago"
          text="The updated playbook has been uploaded to the Files section."
        />
      </List>
    </Page>
  );
}
