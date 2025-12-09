import { Page, Navbar, Block, List, ListItem, ListInput } from 'framework7-react';

export default function ProfilePage() {
  return (
    <Page name="profile">
      <Navbar title="Profile" backLink="Back" />

      <Block className="text-center !mt-6">
        <div className="w-24 h-24 rounded-full bg-primary-100 mx-auto flex items-center justify-center">
          <span className="text-3xl font-semibold text-primary-500">JD</span>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-typography-900">John Doe</h2>
        <p className="text-typography-600">Head Coach</p>
      </Block>

      <List inset>
        <ListInput
          label="First Name"
          type="text"
          placeholder="Enter first name"
          value="John"
        />
        <ListInput
          label="Last Name"
          type="text"
          placeholder="Enter last name"
          value="Doe"
        />
        <ListInput
          label="Email"
          type="email"
          placeholder="Enter email"
          value="john.doe@example.com"
          disabled
        />
      </List>

      <List inset>
        <ListItem link="#" title="Change Password" />
        <ListItem link="#" title="Notification Settings" />
        <ListItem link="#" title="Sign Out" className="text-error-500" />
      </List>
    </Page>
  );
}
