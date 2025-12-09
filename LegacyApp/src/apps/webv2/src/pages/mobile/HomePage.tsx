import { Page, Navbar, Block, Fab, NavRight, Link } from 'framework7-react';
import { MoreVertical, Calendar as CalendarIcon, Menu } from 'lucide-react';

/**
 * Mobile home page - Practice tab (matches PracticeMobile from native app)
 * Shows today's or next upcoming practice plan
 */
export default function HomePage() {
  // TODO: Connect to store to get real data
  const todayPractice = {
    id: '1',
    startTime: '3:00 PM',
    endTime: '4:00 PM',
    duration: '1h',
    activities: [],
  };

  const hasPractice = true; // TODO: Check if practice exists
  const teamName = 'Battle Hawks'; // TODO: Get from store

  return (
    <Page name="home" className="!bg-[#e0e0e0]">
      {/* Blue navbar matching native app */}
      <Navbar className="!bg-primary-500">
        <div className="w-full flex items-center justify-between px-4">
          <span className="text-white text-lg font-semibold">{teamName}</span>
          <NavRight>
            <Link iconOnly className="!text-white">
              <Menu size={24} />
            </Link>
          </NavRight>
        </div>
      </Navbar>

      {hasPractice ? (
        <>
          {/* Time Display Banner - matches native app */}
          <Block className="!bg-white !px-5 !py-3 !border-b !border-gray-200 !m-0">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {todayPractice.startTime} - {todayPractice.endTime}
                <span className="text-gray-500"> ({todayPractice.duration})</span>
              </p>
            </div>
          </Block>

          {/* Practice Content */}
          <Block className="!px-5 !pt-5 !pb-24">
            <div className="bg-white rounded-xl p-4 shadow-sm min-h-[200px]">
              {/* Empty state - no activities */}
            </div>

            {/* Tap to Edit Hint */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Tap a period to edit this instance
            </p>
          </Block>
        </>
      ) : (
        /* Empty State */
        <Block className="!py-16 !px-5">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CalendarIcon size={32} color="#9CA3AF" />
            </div>
            <p className="text-lg font-semibold text-gray-700">No Practice Scheduled</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Create a plan to start practicing
            </p>
          </div>
        </Block>
      )}

      {/* FAB - Floating Action Button with three dots */}
      <Fab position="right-bottom" slot="fixed" color="blue">
        <MoreVertical size={24} />
      </Fab>
    </Page>
  );
}
