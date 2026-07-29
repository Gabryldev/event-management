import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const StatCard = ({ label, value }) => (
  <div className="card p-4">
    <p className="eyebrow mb-1">{label}</p>
    <p className="font-display text-2xl font-semibold">{value}</p>
  </div>
);

const EventAnalytics = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/analytics/event/${eventId}`).then((res) => setData(res.data.data));
  }, [eventId]);

  if (!data) return <div className="max-w-4xl mx-auto px-4 py-16 text-slate-muted">Loading...</div>;

  const chartData = Object.entries(data.salesByDay || {}).map(([day, count]) => ({ day, tickets: count }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <p className="eyebrow mb-1">Event analytics</p>
      <h1 className="font-display text-3xl font-semibold mb-6">{data.title}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Tickets sold" value={data.totalTicketsSold} />
        <StatCard label="Revenue" value={`$${data.revenue.toFixed(2)}`} />
        <StatCard label="Checked in" value={data.checkedIn} />
        <StatCard label="Attendance rate" value={`${data.attendanceRate}%`} />
      </div>

      <div className="card p-5">
        <p className="font-medium mb-4">Sales over time</p>
        {chartData.length === 0 ? (
          <p className="text-slate-muted text-sm">No sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#14213D10" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="tickets" fill="#F2A93B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-6 text-sm text-slate-muted">
        {data.seatsAvailable} of {data.capacity} seats remaining · {data.cancelled} cancelled tickets
      </div>
    </div>
  );
};

export default EventAnalytics;
