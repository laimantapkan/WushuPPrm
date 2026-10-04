import React, { useState, useEffect } from 'react';
import { AppState, UserRole, Athlete, Coach, Official, ChecklistItem, WeighInLog, MatchSchedule, DocumentItem, DailyNote, AppSettings } from './types';
import { FirebaseService } from './services/firebase';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AthletesList } from './components/AthletesList';
import { CoachesList } from './components/CoachesList';
import { ChecklistsView } from './components/ChecklistsView';
import { SandaWeighIn } from './components/SandaWeighIn';
import { MatchesView } from './components/MatchesView';
import { DailyNotesView } from './components/DailyNotesView';
import { SettingsView } from './components/SettingsView';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  // Initialize state from FirebaseService (reads LocalStorage cache first so reloads never lose edited data)
  const [state, setState] = useState<AppState>(() => FirebaseService.getInitialState());
  const [isConnected, setIsConnected] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  useEffect(() => {
    // Subscribe to Firebase Firestore Cloud Database real-time state sync
    FirebaseService.init(
      (updatedState) => setState(updatedState),
      (connected) => setIsConnected(connected)
    );

    return () => {
      FirebaseService.removeListener((updatedState) => setState(updatedState));
    };
  }, []);

  // Sync Favicon Link
  useEffect(() => {
    if (state.settings.faviconUrl) {
      const faviconLink = document.getElementById('app-favicon') as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = state.settings.faviconUrl;
      }
    }
  }, [state.settings.faviconUrl]);

  // Helper to commit state changes and sync immediately to LocalStorage, Firestore, and Server Disk
  const updateStore = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      FirebaseService.updateState(next);
      return next;
    });
  };

  // Athlete CRUD
  const handleSaveAthlete = (athlete: Athlete) => {
    updateStore((prev) => {
      const exists = prev.athletes.some((a) => a.id === athlete.id);
      const newAthletes = exists
        ? prev.athletes.map((a) => (a.id === athlete.id ? athlete : a))
        : [...prev.athletes, athlete];

      return { ...prev, athletes: newAthletes };
    });
  };

  const handleDeleteAthlete = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      athletes: prev.athletes.filter((a) => a.id !== id),
    }));
  };

  // Coach & Official CRUD
  const handleSaveCoach = (coach: Coach) => {
    updateStore((prev) => {
      const exists = prev.coaches.some((c) => c.id === coach.id);
      const newCoaches = exists
        ? prev.coaches.map((c) => (c.id === coach.id ? coach : c))
        : [...prev.coaches, coach];
      return { ...prev, coaches: newCoaches };
    });
  };

  const handleDeleteCoach = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      coaches: prev.coaches.filter((c) => c.id !== id),
    }));
  };

  const handleSaveOfficial = (official: Official) => {
    updateStore((prev) => {
      const exists = prev.officials.some((o) => o.id === official.id);
      const newOfficials = exists
        ? prev.officials.map((o) => (o.id === official.id ? official : o))
        : [...prev.officials, official];
      return { ...prev, officials: newOfficials };
    });
  };

  const handleDeleteOfficial = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      officials: prev.officials.filter((o) => o.id !== id),
    }));
  };

  // Checklist Actions
  const handleToggleChecklistItem = (id: string, isChecked: boolean) => {
    updateStore((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) =>
        c.id === id ? { ...c, isChecked, updatedAt: new Date().toISOString() } : c
      ),
    }));
  };

  const handleUpdateChecklistItem = (item: ChecklistItem) => {
    updateStore((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) => (c.id === item.id ? item : c)),
    }));
  };

  const handleAddChecklistItem = (itemData: Omit<ChecklistItem, 'id' | 'updatedAt'>) => {
    const newItem: ChecklistItem = {
      ...itemData,
      id: `chk-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    updateStore((prev) => ({
      ...prev,
      checklists: [...prev.checklists, newItem],
    }));
  };

  // Athlete Document Verification Checklists
  const handleToggleAthleteDoc = (
    athleteId: string,
    docKey: 'suratPembebasan' | 'aktaIjazahKtp' | 'suketKesehatan',
    checked: boolean
  ) => {
    updateStore((prev) => {
      const updatedAthletes = prev.athletes.map((a) => {
        if (a.id !== athleteId) return a;
        const currentDocChecklist = a.docChecklist || {
          suratPembebasan: a.docStatus === 'Lengkap',
          aktaIjazahKtp: a.docStatus === 'Lengkap',
          suketKesehatan: a.docStatus === 'Lengkap',
        };
        const updatedChecklist = {
          ...currentDocChecklist,
          [docKey]: checked,
        };
        const isAllChecked =
          updatedChecklist.suratPembebasan &&
          updatedChecklist.aktaIjazahKtp &&
          updatedChecklist.suketKesehatan;
        const isNoneChecked =
          !updatedChecklist.suratPembebasan &&
          !updatedChecklist.aktaIjazahKtp &&
          !updatedChecklist.suketKesehatan;

        const docStatus: 'Lengkap' | 'Belum Lengkap' | 'Sedang Diproses' = isAllChecked
          ? 'Lengkap'
          : isNoneChecked
          ? 'Belum Lengkap'
          : 'Sedang Diproses';

        return {
          ...a,
          docStatus,
          docChecklist: updatedChecklist,
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...prev, athletes: updatedAthletes };
    });
  };

  const handleSetAthleteAllDocs = (athleteId: string, isComplete: boolean) => {
    updateStore((prev) => {
      const updatedAthletes = prev.athletes.map((a) => {
        if (a.id !== athleteId) return a;
        return {
          ...a,
          docStatus: isComplete ? ('Lengkap' as const) : ('Belum Lengkap' as const),
          docChecklist: {
            suratPembebasan: isComplete,
            aktaIjazahKtp: isComplete,
            suketKesehatan: isComplete,
          },
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...prev, athletes: updatedAthletes };
    });
  };

  const handleSetAllAthletesAllDocs = (isComplete: boolean) => {
    updateStore((prev) => {
      const updatedAthletes = prev.athletes.map((a) => ({
        ...a,
        docStatus: isComplete ? ('Lengkap' as const) : ('Belum Lengkap' as const),
        docChecklist: {
          suratPembebasan: isComplete,
          aktaIjazahKtp: isComplete,
          suketKesehatan: isComplete,
        },
        updatedAt: new Date().toISOString(),
      }));
      return { ...prev, athletes: updatedAthletes };
    });
  };

  // Sanda Weigh In Log
  const handleAddWeighInLog = (log: WeighInLog, updatedAthleteWeight: number) => {
    updateStore((prev) => {
      const updatedAthletes = prev.athletes.map((a) => {
        if (a.id === log.athleteId) {
          return {
            ...a,
            weight: updatedAthleteWeight,
            sandaDetails: a.sandaDetails
              ? { ...a.sandaDetails, currentWeight: updatedAthleteWeight, weighInStatus: log.status }
              : undefined,
          };
        }
        return a;
      });

      return {
        ...prev,
        athletes: updatedAthletes,
        weighInLogs: [log, ...prev.weighInLogs],
      };
    });
  };

  // Match Schedule Actions
  const handleUpdateMatchStatus = (matchId: string, status: any) => {
    updateStore((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => (m.id === matchId ? { ...m, status } : m)),
    }));
  };

  const handleAddMatch = (match: MatchSchedule) => {
    updateStore((prev) => ({
      ...prev,
      matches: [...prev.matches, match],
    }));
  };

  const handleDeleteMatch = (matchId: string) => {
    updateStore((prev) => ({
      ...prev,
      matches: prev.matches.filter((m) => m.id !== matchId),
    }));
  };

  // Daily Notes Actions
  const handleSaveDailyNote = (note: DailyNote) => {
    updateStore((prev) => {
      const currentNotes = prev.dailyNotes || [];
      const exists = currentNotes.some((n) => n.id === note.id);
      const newNotes = exists
        ? currentNotes.map((n) => (n.id === note.id ? note : n))
        : [note, ...currentNotes];
      return { ...prev, dailyNotes: newNotes };
    });
  };

  const handleDeleteDailyNote = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      dailyNotes: (prev.dailyNotes || []).filter((n) => n.id !== id),
    }));
  };

  // Documents Actions
  const handleAddDocument = (doc: DocumentItem) => {
    updateStore((prev) => ({
      ...prev,
      documents: [doc, ...prev.documents],
    }));
  };

  const handleUpdateDocumentStatus = (id: string, status: any) => {
    updateStore((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === id ? { ...d, status } : d)),
    }));
  };

  const handleDeleteDocument = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
  };

  // Settings & Reset Actions
  const handleSaveSettings = (settings: AppSettings) => {
    updateStore((prev) => ({ ...prev, settings }));
  };

  const handleResetData = () => {
    FirebaseService.resetData();
  };

  // Notifications
  const handleMarkNotifRead = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const handleClearAllNotifs = () => {
    updateStore((prev) => ({ ...prev, notifications: [] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={state.notifications}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        isConnected={isConnected}
        contingentName={state.settings.contingentName}
        faviconUrl={state.settings.faviconUrl}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto items-start">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          unreadNotificationsCount={state.notifications.filter((n) => !n.read).length}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard state={state} onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'atlet' && (
            <AthletesList
              athletes={state.athletes}
              checklists={state.checklists}
              onSaveAthlete={handleSaveAthlete}
              onDeleteAthlete={handleDeleteAthlete}
              filterDiscipline="ALL"
              onNavigateToChecklist={() => setActiveTab('checklist')}
            />
          )}

          {activeTab === 'manajemen' && (
            <CoachesList
              coaches={state.coaches}
              officials={state.officials}
              onSaveCoach={handleSaveCoach}
              onDeleteCoach={handleDeleteCoach}
              onSaveOfficial={handleSaveOfficial}
              onDeleteOfficial={handleDeleteOfficial}
              defaultTab="coaches"
            />
          )}

          {activeTab === 'checklist' && (
            <ChecklistsView
              checklists={state.checklists}
              athletes={state.athletes}
              onToggleItem={handleToggleChecklistItem}
              onUpdateItem={handleUpdateChecklistItem}
              onAddItem={handleAddChecklistItem}
              onToggleAthleteDoc={handleToggleAthleteDoc}
              onSetAthleteAllDocs={handleSetAthleteAllDocs}
              onSetAllAthletesAllDocs={handleSetAllAthletesAllDocs}
            />
          )}

          {activeTab === 'timbang' && (
            <SandaWeighIn
              sandaAthletes={state.athletes.filter((a) => a.discipline === 'Sanda')}
              weighInLogs={state.weighInLogs}
              onAddWeighInLog={handleAddWeighInLog}
            />
          )}

          {activeTab === 'pertandingan' && (
            <MatchesView
              matches={state.matches}
              onUpdateMatchStatus={handleUpdateMatchStatus}
              onAddMatch={handleAddMatch}
              onDeleteMatch={handleDeleteMatch}
            />
          )}

          {activeTab === 'catatan' && (
            <DailyNotesView
              notes={state.dailyNotes || []}
              athletes={state.athletes}
              onSaveNote={handleSaveDailyNote}
              onDeleteNote={handleDeleteDailyNote}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsView
              settings={state.settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={state.notifications}
        checklists={state.checklists}
        athletes={state.athletes}
        onMarkAsRead={handleMarkNotifRead}
        onClearAll={handleClearAllNotifs}
      />
    </div>
  );
}
