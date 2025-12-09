import { Page, Navbar, Block, List, ListItem, ListInput } from 'framework7-react';

export default function TeamPage() {
  return (
    <Page name="team">
      <Navbar title="Team Settings" backLink="Back" />

      <Block className="text-center !mt-6">
        <div className="w-20 h-20 rounded-xl bg-primary-500 mx-auto flex items-center justify-center">
          <span className="text-2xl font-bold text-white">TN</span>
        </div>
      </Block>

      <List inset>
        <ListInput
          label="Team Name"
          type="text"
          placeholder="Enter team name"
          value="Team Name"
        />
        <ListInput
          label="Sport"
          type="text"
          placeholder="Select sport"
          value="Basketball"
        />
        <ListInput
          label="Organization"
          type="text"
          placeholder="Enter organization"
          value="Sports Academy"
        />
      </List>

      <List inset>
        <ListItem link="#" title="Team Logo" after="Change" />
        <ListItem link="#" title="Primary Color" after="#356793" />
        <ListItem link="#" title="Time Zone" after="America/New_York" />
      </List>

      <List inset>
        <ListItem link="#" title="Export Team Data" />
        <ListItem link="#" title="Delete Team" className="text-error-500" />
      </List>
    </Page>
  );
}
