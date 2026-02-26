
import { useContext } from 'react';
import { NewsroomContext } from '../contexts/NewsroomContext';

export const useNewsroom = () => {
  const context = useContext(NewsroomContext);
  if (context === undefined) {
    throw new Error('useNewsroom must be used within a NewsroomProvider');
  }
  return context;
};
