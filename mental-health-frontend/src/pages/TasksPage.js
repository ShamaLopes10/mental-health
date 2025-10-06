import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { getTasks, completeTask, getProfile, setAuthToken } from '../utils/api';
import bgImg from '../assets/img/bg.jpg';

const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  height: 100%;
  margin: 1.5rem auto;
  padding: 1rem;
  background: url(${bgImg}) center/cover no-repeat;
`;

const Header = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom: 1rem;
  flex-wrap:wrap;
`;

const Title = styled.h1`
  color:#146c94;
  margin:0;
  font-size:1.9rem;
`;

const Stats = styled.div`
  display:flex;
  gap:1rem;
  align-items:center;
  font-weight:600;
  color:#333;
`;

const TaskGrid = styled.div`
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const TaskCard = styled.div`
  background:#fff;
  border-radius:10px;
  padding:1rem;
  box-shadow:0 6px 12px rgba(0,0,0,0.06);
  display:flex;
  flex-direction:column;
  justify-content:space-between;
`;

const TaskTitle = styled.h3` margin: 0 0 0.5rem; font-size: 1.05rem; color: #0d47a1; `;
const TaskDesc = styled.p` margin:0 0 0.75rem; color:#444; font-size: 0.95rem; `;
const Tags = styled.div` font-size:0.85rem; color:#00796b; margin-bottom:0.5rem; `;
const Btn = styled.button`
  background:#19a7ce;
  color:white;
  border:none;
  padding:0.6rem 0.9rem;
  border-radius:8px;
  cursor:pointer;
  font-weight:700;

  &:disabled { opacity:0.5; cursor: default; }
`;

const FilterRow = styled.div`
  display:flex;
  gap:0.5rem;
  margin-bottom:1rem;
  align-items:center;
  flex-wrap:wrap;
`;

const Input = styled.input`
  padding:0.6rem 0.8rem; border-radius:6px; border:1px solid #ccc; min-width:220px;
`;

const InfoBar = styled.div`
  margin-top:1rem;
  padding:1rem;
  border-radius:8px;
  background:#f8f8f8;
  color:#333;
`;

const TasksPage = () => {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMood, setFilterMood] = useState('');
  const [search, setSearch] = useState('');
  const [userStats, setUserStats] = useState({ points: 0, currentStreak: 0, longestStreak: 0 });
  const [completing, setCompleting] = useState({});

  const loadStats = useCallback(async () => {
    try {
      const res = await getProfile();
      setUserStats({
        points: res?.points || 0,
        currentStreak: res?.currentStreak || 0,
        longestStreak: res?.longestStreak || 0,
      });
    } catch (err) {
      console.error('stats error', err);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filterMood) filters.mood = filterMood;
      if (search) filters.search = search;
      const items = await getTasks(filters);
      setTasks(items || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filterMood, search]);

  useEffect(() => { if (token) setAuthToken(token); }, [token]);

  useEffect(() => {
    getProfile().then(res => {
      setUserStats({
        points: res?.points || 0,
        currentStreak: res?.currentStreak || 0,
        longestStreak: res?.longestStreak || 0
      });
    });
  }, []);

  useEffect(() => { if (!authLoading && isAuthenticated) { loadStats(); loadTasks(); } }, [authLoading, isAuthenticated, loadStats, loadTasks]);

  const handleComplete = async (taskId) => {
    setCompleting(prev => ({ ...prev, [taskId]: true }));
    const task = tasks.find(t => t.id === taskId);
    try {
      const res = await completeTask(taskId);
      setUserStats(prev => ({
        points: prev.points + (task?.points || 0),
        currentStreak: res.updated.currentStreak ?? prev.currentStreak,
        longestStreak: res.updated.longestStreak ?? prev.longestStreak
      }));
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, justCompleted: true } : t));
      alert(`Nice! +${task?.points || 0} points earned`);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || 'Failed to complete task.');
    } finally {
      setCompleting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Tasks — Active, short practices</Title>
        <Stats>
          <div>Points: <strong>{userStats.points}</strong></div>
          <div>Streak: <strong>{userStats.currentStreak}🔥</strong></div>
        </Stats>
      </Header>

      <FilterRow>
        <Input placeholder="Filter mood (e.g. stress, sadness)" value={filterMood} onChange={(e)=>setFilterMood(e.target.value)} />
        <Input placeholder="Search tasks" value={search} onChange={(e)=>setSearch(e.target.value)} />
        <Btn onClick={loadTasks}>Filter</Btn>
        <Btn onClick={() => { setFilterMood(''); setSearch(''); loadTasks(); }}>Clear</Btn>
      </FilterRow>

      {loading && <div>Loading tasks...</div>}
      {error && <InfoBar style={{background:'#ffe9e9', color:'#b71c1c'}}>{error}</InfoBar>}

      <TaskGrid>
        {tasks.map(t => (
          <TaskCard key={t.id}>
            <div>
              <TaskTitle>{t.title}</TaskTitle>
              <Tags>{(t.moodTags || []).join(', ')}</Tags>
              <TaskDesc>{t.description}</TaskDesc>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1rem'}}>
              <div style={{fontSize:'0.9rem', color:'#666'}}>Points: {t.points ?? 10}</div>
              <Btn disabled={completing[t.id] || t.justCompleted} onClick={() => handleComplete(t.id)}>
                {t.justCompleted ? 'Completed' : (completing[t.id] ? 'Saving...' : 'Done')}
              </Btn>
            </div>
          </TaskCard>
        ))}
      </TaskGrid>

      <InfoBar>
        Tip: complete at least one short task a day to keep your streak.
      </InfoBar>
    </PageContainer>
  );
};

export default TasksPage;
