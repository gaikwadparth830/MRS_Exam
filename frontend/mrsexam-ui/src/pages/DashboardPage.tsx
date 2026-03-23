import { useMemo, useState } from 'react'

import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'

type SubMenuItem = {
  label: string
  children?: string[]
}

const formEntryExamItems = ['Pandit', 'Praveshika', 'Prathamik', 'Prabodh', 'Praveen', 'Subodh', 'Balbodhini']

const mainMenuItems = [
  'Master',
  'Supervisor',
  'Processing',
  'Transaction',
  'Query',
  'Utilities',
  'Reports',
  'Help',
] as const

type MainMenu = (typeof mainMenuItems)[number]

const menuConfig: Record<MainMenu, SubMenuItem[]> = {
  Master: [
    { label: 'Region Master' },
    { label: 'District Master' },
    { label: 'Center Master' },
    { label: 'Exam Master' },
    { label: 'Paper Master' },
    { label: 'Session Master' },
  ],
  Supervisor: [
    { label: 'User Management' },
    { label: 'Reset Result Generated Flag' },
    { label: 'Update Marks' },
    { label: 'Insert record with name "-"' },
  ],
  Processing: [
    { label: 'Cross Reference' },
    { label: 'Generate Resdult' },
    { label: 'Export Center Data to Foxpro' },
    { label: 'Set Roll Nos' },
    { label: 'Aur Forms - Set Roll Numbsers' },
  ],
  Transaction: [
    { label: 'Form Entry', children: formEntryExamItems },
    { label: 'Marks Entry', children: formEntryExamItems },
  ],
  Query: [
    { label: 'List of Students losing grade by 2 marks' },
  ],
  Utilities: [
    { label: 'Select Session' },
    { label: 'Print Lables for centers' },
    { label: 'Print Center Address Only' },
  ],
  Reports: [
    { label: 'Attendence Sheet' },
    { label: 'Result Sheet' },
    { label: 'Marks Sheet' },
    { label: 'Certificate' },
    { label: 'Center wise No of Students Appearing' },
    { label: 'Userwise Examwise Total No of Forms Entered' },
    { label: 'List of Centres' },
    { label: 'Name List' },
    { label: 'Hall Ticket Prining' },
    { label: 'Register' },
  ],
  Help: [],
}
const defaultMasterPage: MasterPageKey = 'Region Master'
const defaultFormEntryExam = formEntryExamItems[0]
const defaultMarksEntryExam = formEntryExamItems[0]

const getDefaultSubMenuItem = (menu: MainMenu): string | null => {
  if (menu === 'Master') {
    return defaultMasterPage
  }

  return menuConfig[menu][0]?.label ?? null
}

const createDefaultSubMenuState = (): Record<MainMenu, string | null> => ({
  Master: getDefaultSubMenuItem('Master'),
  Supervisor: getDefaultSubMenuItem('Supervisor'),
  Processing: getDefaultSubMenuItem('Processing'),
  Transaction: getDefaultSubMenuItem('Transaction'),
  Query: getDefaultSubMenuItem('Query'),
  Utilities: getDefaultSubMenuItem('Utilities'),
  Reports: getDefaultSubMenuItem('Reports'),
  Help: getDefaultSubMenuItem('Help'),
})

export const DashboardPage = () => {
  const [activeMainMenu, setActiveMainMenu] = useState<MainMenu>('Master')
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true)
  const [activeMasterPage, setActiveMasterPage] = useState<MasterPageKey>(defaultMasterPage)
  const [activeFormEntryExam, setActiveFormEntryExam] = useState(defaultFormEntryExam)
  const [activeMarksEntryExam, setActiveMarksEntryExam] = useState(defaultMarksEntryExam)
  const [activeSubMenuByMain, setActiveSubMenuByMain] = useState<Record<MainMenu, string | null>>(
    () => createDefaultSubMenuState(),
  )

  const activeSubMenuItems = useMemo(
    () => menuConfig[activeMainMenu],
    [activeMainMenu],
  )

  const onSelectMainMenu = (item: MainMenu) => {
    setActiveMainMenu(item)
    setIsSubMenuOpen(true)

    if (item === 'Master') {
      setActiveMasterPage(defaultMasterPage)
      setActiveSubMenuByMain((current) => ({
        ...current,
        Master: defaultMasterPage,
      }))
      return
    }

    const defaultItem = getDefaultSubMenuItem(item)
    setActiveSubMenuByMain((current) => ({
      ...current,
      [item]: defaultItem,
    }))

    if (item === 'Transaction' && defaultItem === 'Form Entry') {
      setActiveFormEntryExam(defaultFormEntryExam)
    }

    if (item === 'Transaction' && defaultItem === 'Marks Entry') {
      setActiveMarksEntryExam(defaultMarksEntryExam)
    }
  }

  const onSelectSubMenu = (item: string) => {
    if (activeMainMenu === 'Master') {
      setActiveMasterPage(item as MasterPageKey)
      setActiveSubMenuByMain((current) => ({
        ...current,
        Master: item,
      }))
      return
    }

    setActiveSubMenuByMain((current) => ({
      ...current,
      [activeMainMenu]: item,
    }))

    if (activeMainMenu === 'Transaction' && item === 'Form Entry') {
      setActiveFormEntryExam(defaultFormEntryExam)
    }

    if (activeMainMenu === 'Transaction' && item === 'Marks Entry') {
      setActiveMarksEntryExam(defaultMarksEntryExam)
    }
  }

  const onSelectTransactionExam = (parentItem: 'Form Entry' | 'Marks Entry', exam: string) => {
    setActiveSubMenuByMain((current) => ({
      ...current,
      Transaction: parentItem,
    }))

    if (parentItem === 'Form Entry') {
      setActiveFormEntryExam(exam)
      return
    }

    setActiveMarksEntryExam(exam)
  }

  const selectedSubMenu = activeSubMenuByMain[activeMainMenu]

  return (
    <main className="dashboard-page">
      <div className="menu-shell">
        <aside className="sidebar" aria-label="Main menu panel">
          <h1 className="sidebar-title">MRS Exam</h1>
          <nav className="main-menu-vertical" aria-label="Primary navigation">
            {mainMenuItems.map((item) => {
              const isActive = item === activeMainMenu

              return (
                <button
                  key={item}
                  type="button"
                  className={`menu-chip ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectMainMenu(item)}
                >
                  <span>{item}</span>
                  <span className="menu-arrow">{isActive && isSubMenuOpen ? '▾' : '▸'}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {isSubMenuOpen ? (
          <section className="submenu-panel" aria-label="Sub menu panel">
            <div className="submenu-head">
              <h2>{activeMainMenu}</h2>
              <button
                type="button"
                className="collapse-toggle"
                onClick={() => setIsSubMenuOpen(false)}
                aria-label="Close submenu"
              >
                Close
              </button>
            </div>

            <ul id="active-submenu-list" className="submenu-list">
              {activeSubMenuItems.length > 0 ? (
                activeSubMenuItems.map((item) => {
                  const isActive = activeMainMenu === 'Master'
                    ? item.label === activeMasterPage
                    : item.label === selectedSubMenu
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0
                  const showChildren = activeMainMenu === 'Transaction' && hasChildren && isActive

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        className={`submenu-link ${isActive ? 'active' : ''}`}
                        onClick={() => onSelectSubMenu(item.label)}
                      >
                        {item.label}
                      </button>

                      {showChildren ? (
                        <ul className="submenu-children" aria-label={`${item.label} exam submenu`}>
                          {(item.children ?? []).map((child) => {
                            const isChildActive = item.label === 'Form Entry'
                              ? child === activeFormEntryExam
                              : child === activeMarksEntryExam

                            return (
                              <li key={child}>
                                <button
                                  type="button"
                                  className={`submenu-child-link ${isChildActive ? 'active' : ''}`}
                                  onClick={() => onSelectTransactionExam(item.label as 'Form Entry' | 'Marks Entry', child)}
                                >
                                  {child}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      ) : null}
                    </li>
                  )
                })
              ) : (
                <li>No submenu items configured.</li>
              )}
            </ul>
          </section>
        ) : (
          <button
            type="button"
            className="open-submenu"
            onClick={() => setIsSubMenuOpen(true)}
          >
            Open {activeMainMenu} Menu
          </button>
        )}

        <section className="content-placeholder" aria-label="Workspace area">
          {activeMainMenu === 'Master' ? (
            <MasterMenuPage pageKey={activeMasterPage} />
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Form Entry' ? (
            <section className="master-page" aria-label="Form entry placeholder">
              <header className="master-page-head">
                <h2>Form Entry - {activeFormEntryExam}</h2>
                <p>{activeFormEntryExam} form entry page will be available soon.</p>
              </header>
            </section>
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Marks Entry' ? (
            <section className="master-page" aria-label="Marks entry placeholder">
              <header className="master-page-head">
                <h2>Marks Entry - {activeMarksEntryExam}</h2>
                <p>{activeMarksEntryExam} marks entry page will be available soon.</p>
              </header>
            </section>
          ) : (
            <section className="master-page" aria-label="Main menu placeholder">
              <header className="master-page-head">
                <h2>{selectedSubMenu ?? activeMainMenu}</h2>
                <p>Page for {selectedSubMenu ?? activeMainMenu} will be available soon.</p>
              </header>
            </section>
          )}
        </section>
      </div>
    </main>
  )
}