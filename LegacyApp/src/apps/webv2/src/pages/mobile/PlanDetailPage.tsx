import { Page, Navbar, Block, List, ListItem, Button, NavRight, Link } from 'framework7-react';
import { Edit, Trash2, Share2, Clock } from 'lucide-react';

export default function PlanDetailPage() {
  return (
    <Page name="plan-detail">
      <Navbar title="Practice Plan" backLink="Back">
        <NavRight>
          <Link iconOnly>
            <Edit className="w-5 h-5" />
          </Link>
        </NavRight>
      </Navbar>

      <Block className="!mt-4">
        <h2 className="text-xl font-semibold text-typography-900">Morning Practice</h2>
        <p className="text-typography-600 mt-1">December 8, 2025</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-typography-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            9:00 AM - 11:00 AM
          </span>
          <span>2 hours</span>
        </div>
      </Block>

      <Block className="!mt-2">
        <p className="text-sm text-typography-600 font-medium">Periods (5)</p>
      </Block>

      <List mediaList inset>
        <ListItem
          title="Warm Up"
          subtitle="9:00 AM - 9:15 AM"
          text="15 min"
        />
        <ListItem
          title="Skill Work"
          subtitle="9:15 AM - 9:35 AM"
          text="20 min"
        />
        <ListItem
          title="Team Drills"
          subtitle="9:35 AM - 10:05 AM"
          text="30 min"
        />
        <ListItem
          title="Scrimmage"
          subtitle="10:05 AM - 10:30 AM"
          text="25 min"
        />
        <ListItem
          title="Cool Down"
          subtitle="10:30 AM - 10:40 AM"
          text="10 min"
        />
      </List>

      <Block className="flex gap-2">
        <Button outline className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button outline color="red" className="flex-1">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </Block>
    </Page>
  );
}
