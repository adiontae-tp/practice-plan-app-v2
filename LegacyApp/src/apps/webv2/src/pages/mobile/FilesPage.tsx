import { Page, Navbar, Block, List, ListItem, Searchbar } from 'framework7-react';

export default function FilesPage() {
  return (
    <Page name="files">
      <Navbar title="Files" backLink="Back" />

      <Searchbar
        searchContainer=".search-list"
        searchIn=".item-title"
        placeholder="Search files..."
      />

      <Block className="!mt-4 flex justify-end">
        <a href="#" className="flex items-center gap-1 text-primary-500 text-sm font-medium">
          + Upload File
        </a>
      </Block>

      <List className="search-list" mediaList inset strong>
        <ListItem
          title="Practice Plans"
          subtitle="3 items"
          after="Folder"
        />
        <ListItem
          title="Playbook.pdf"
          subtitle="2.4 MB"
          after="PDF"
        />
        <ListItem
          title="Team Photo.jpg"
          subtitle="1.2 MB"
          after="Image"
        />
        <ListItem
          title="Schedule.xlsx"
          subtitle="156 KB"
          after="Excel"
        />
      </List>
    </Page>
  );
}
