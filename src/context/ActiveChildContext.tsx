import React, { createContext, useContext, useEffect, useState } from 'react';
import { LinkedChildSummary } from '../types/student';
import { ParentService } from '../services/parentService';

interface ActiveChildContextType {
  childrenList: LinkedChildSummary[];
  activeChild: LinkedChildSummary | null;
  isLoading: boolean;
  hasError: boolean;
  selectChild: (child: LinkedChildSummary) => void;
  refreshChildren: () => Promise<void>;
}

const ActiveChildContext = createContext<ActiveChildContextType | undefined>(undefined);

export const ActiveChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<LinkedChildSummary[]>([]);
  const [activeChild, setActiveChild] = useState<LinkedChildSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    refreshChildren();
  }, []);

  const refreshChildren = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await ParentService.getLinkedChildren();
      setChildrenList(data);
      if (data.length > 0) {
        setActiveChild((prev) => {
          if (prev) {
            const found = data.find((c) => c.studentId === prev.studentId);
            if (found) return found;
          }
          return data[0];
        });
      } else {
        setActiveChild(null);
      }
    } catch {
      setHasError(true);
      setChildrenList([]);
      setActiveChild(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectChild = (child: LinkedChildSummary) => {
    setActiveChild(child);
  };

  return (
    <ActiveChildContext.Provider
      value={{
        childrenList,
        activeChild,
        isLoading,
        hasError,
        selectChild,
        refreshChildren,
      }}
    >
      {children}
    </ActiveChildContext.Provider>
  );
};

export const useActiveChild = () => {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error('useActiveChild must be used within an ActiveChildProvider');
  }
  return context;
};