import { Page, Navbar, Block, Segmented, Button, Fab } from 'framework7-react';
import { Plus, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';

/**
 * Mobile calendar page - Week/Month view (matches CalendarMobile from native app)
 */
export default function CalendarPage() {
  // TODO: Connect to store for real data and state
  const viewMode = 'week'; // week or month
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDates = [15, 16, 17, 18, 19, 20, 21]; // Mock dates

  const practices = [
    {
      id: '1',
      day: 'Monday',
      date: 16,
      startTime: '9:00 AM',
      endTime: '11:00 AM',
      duration: '2h',
    },
    {
      id: '2',
      day: 'Wednesday',
      date: 18,
      startTime: '2:00 PM',
      endTime: '4:00 PM',
      duration: '2h',
    },
  ];

  return (
    <Page name="calendar" className="!bg-[#e0e0e0]">
      <Navbar title="Calendar" />

      {/* View Mode Toggle */}
      <Block className="!px-5 !pt-5 !pb-2">
        <Segmented raised>
          <Button active={viewMode === 'week'}>Week</Button>
          <Button active={viewMode === 'month'}>Month</Button>
        </Segmented>
      </Block>

      {/* Week Days Row */}
      <Block className="!bg-white !rounded-xl !p-3 !mx-5 !mt-3 !shadow-sm">
        <div className="flex">
          {weekDays.map((day, index) => {
            const isToday = index === 2; // Mock: Wednesday is today
            const practicesOnDay = practices.filter((p) => p.date === weekDates[index]);

            return (
              <div
                key={index}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-1 ${
                    isToday ? 'text-primary-500' : 'text-gray-600'
                  }`}
                >
                  {day}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isToday ? 'text-primary-500' : 'text-gray-900'
                  }`}
                >
                  {weekDates[index]}
                </p>
                {practicesOnDay.length > 0 && (
                  <div className="bg-secondary-500 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 mt-1">
                    <p className="text-white text-xs font-semibold">
                      {practicesOnDay.length}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Block>

      {/* Week Navigation */}
      <Block className="!flex !flex-row !items-center !justify-between !px-5 !pt-4 !pb-5">
        <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
          <span className="text-2xl font-semibold text-primary-500">‹</span>
        </button>

        <div className="flex-1 flex flex-col items-center px-4">
          <p className="text-base font-semibold text-gray-900">Sun 15 - Sat 21 Dec</p>
        </div>

        <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
          <span className="text-2xl font-semibold text-primary-500">›</span>
        </button>
      </Block>

      {/* Practices List */}
      <Block className="!px-5 !pb-24">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm flex items-center"
          >
            {/* Calendar Avatar */}
            <div className="w-14 h-14 bg-primary-500 rounded-lg flex flex-col items-center justify-center mr-3">
              <p className="text-white text-xs font-semibold">
                {practice.day.substring(0, 3)}
              </p>
              <p className="text-white text-xl font-bold">{practice.date}</p>
            </div>

            {/* Practice Info */}
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900 mb-1">
                {practice.day}, December {practice.date}
              </p>
              <p className="text-sm text-gray-600">
                {practice.startTime} - {practice.endTime} ({practice.duration})
              </p>
            </div>

            {/* Three-dot menu */}
            <button className="p-2">
              <MoreVertical size={20} color="#9CA3AF" />
            </button>
          </div>
        ))}
      </Block>

      {/* FAB - Floating Action Button */}
      <Fab position="right-bottom" slot="fixed" color="blue">
        <Plus size={24} />
      </Fab>
    </Page>
  );
}
