import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ThemeProvider } from './components/common/context/ThemeContext';
import Header from "./components/common/Header";
import Overview from './components/common/Overview';
import Products from './components/Products';
import ApproachSection from './components/ApproachSection';
import AboutSection from './components/AboutSection';
import ProcessSection from './components/ServiceSection';
import CoursesSection from './components/TechnologySection';
import LeadershipSection from './components/LeadershipSection';
import InsightsSection from './components/InsightsSection';
import ContactSection from './components/ContactSection';
import JoinUsSection from './components/JoinUsSection';
import Footer from './components/Footer';
import LoginPage from './components/Auth/login';
import SignupPage from './components/Auth/signup';
import AdminDashboard from './components/admin-dashboard/AdminDashboard';
import AdminLayout from './components/admin-dashboard/AdminLayout';
import Modules from './components/admin-dashboard/modules/Modules';
import AddModule from './components/admin-dashboard/modules/AddModule';
import EditModule from './components/admin-dashboard/modules/EditModule';
import SubModuleDetails from './components/admin-dashboard/modules/SubModuleDetails';
import SubModuleAdd from './components/admin-dashboard/modules/SubModuleAdd';
import VideoDashboard from './components/admin-dashboard/videos/VideoDashboard';
import VideoForm from './components/admin-dashboard/videos/VideoForm';
import VideoDetailPage from './components/admin-dashboard/videos/VideoDetailPage';
import NotesDashboard from './components/admin-dashboard/notes/NotesDashboard';
import NoteForm from './components/admin-dashboard/notes/NoteForm';
import NoteDetailPage from './components/admin-dashboard/notes/NoteDetailPage';
import CommunityDashboard from './components/admin-dashboard/community/CommunityDashboard';
import ThreadDetailPage from './components/admin-dashboard/community/ThreadDetailPage';
import Assignments from './components/admin-dashboard/assignment/Assignments';
import AssignmentForm from './components/admin-dashboard/assignment/AssignmentForm';
import AssignmentDetailPage from './components/admin-dashboard/assignment/AssignmentDetail';

import UserDashboard from './components/student-dashboard/UserDashboard';
import UserModules from './components/student-dashboard/modules/Modules';
import UserModulesDetailPage from './components/student-dashboard/modules/ModuleDetailPage';
import UserSubModulesDetailPage from './components/student-dashboard/modules/SubmoduleDetailPage';
import VideoLibraryPage from './components/student-dashboard/videos/VideoLibraryPage';
import NotesPage from './components/student-dashboard/notes/NotesPage';
import UserNoteDetailPage from './components/student-dashboard/notes/NoteDetailPage';
import StudentAssignmentsPage from './components/student-dashboard/assignments/StudentAssignmentsPage';
import StudentAssignmentDetailPage from './components/student-dashboard/assignments/StudentAssignmentDetailPage';

import icon from './assets/images/icon.png';
import bgVideo from './assets/images/Create_a_seamless_202507212224.mp4';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-transparent">
            <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
              <video 
                className="w-full h-full object-cover opacity-40"
                src={bgVideo}
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            </div>
            
            <main>
              <Helmet>
                <title>Cognitive Crafts</title>
                <link rel="icon" href={icon} type="image/png" sizes="any" />
              </Helmet>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<>
                  <Header />
                  <Overview />
                  <AboutSection />
                  <ProcessSection />
                  <CoursesSection />
                  <JoinUsSection />
                  <Footer />
                </>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Admin Routes */}
                <Route path="/admin-dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin-dashboard/modules" element={<AdminLayout><Modules /></AdminLayout>} />
                <Route path="/admin-dashboard/modules/add" element={<AdminLayout><AddModule /></AdminLayout>} />
                <Route path="/admin-dashboard/modules/edit/:id" element={<AdminLayout><EditModule /></AdminLayout>} />
                <Route path="/admin-dashboard/modules/:moduleId/submodules/add" element={<AdminLayout><SubModuleAdd /></AdminLayout>} />
                <Route path="/admin-dashboard/modules/:moduleId/submodules/:submoduleId" element={<AdminLayout><SubModuleDetails /></AdminLayout>} />
                
                <Route path="/admin-dashboard/videos" element={<AdminLayout><VideoDashboard /></AdminLayout>} />
                <Route path="/admin-dashboard/videos/new" element={<AdminLayout><VideoForm /></AdminLayout>} />
                <Route path="/admin-dashboard/videos/edit/:id" element={<AdminLayout><VideoForm /></AdminLayout>} />
                <Route path="/admin-dashboard/videos/:id" element={<AdminLayout><VideoDetailPage /></AdminLayout>} />
                
                <Route path="/admin-dashboard/notes" element={<AdminLayout><NotesDashboard /></AdminLayout>} />
                <Route path="/admin-dashboard/notes/new" element={<AdminLayout><NoteForm /></AdminLayout>} />
                <Route path="/admin-dashboard/notes/edit/:id" element={<AdminLayout><NoteForm /></AdminLayout>} />
                <Route path="/admin-dashboard/notes/:id" element={<AdminLayout><NoteDetailPage /></AdminLayout>} />

                <Route path="/admin-dashboard/community" element={<AdminLayout><CommunityDashboard /></AdminLayout>} />
                <Route path="/admin-dashboard/community/threads/:id" element={<AdminLayout><ThreadDetailPage /></AdminLayout>} />

                <Route path='/admin-dashboard/assignments' element={<AdminLayout><Assignments/></AdminLayout>} />
                <Route path='/admin-dashboard/assignments/new' element={<AdminLayout><AssignmentForm/></AdminLayout>} />
                <Route path='/admin-dashboard/assignments/edit/:id' element={<AdminLayout><AssignmentForm/></AdminLayout>} />
                <Route path='/admin-dashboard/assignments/:id' element={<AdminLayout><AssignmentDetailPage/></AdminLayout>} />

                {/* Protected Student Routes */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path='/dashboard/modules' element={<UserModules/>}/>
                <Route path='/dashboard/modules/:id' element={<UserModulesDetailPage/>}/>
                <Route path='/dashboard/modules/:id/:submoduleId' element={<UserSubModulesDetailPage/>}/>
                <Route path='/dashboard/videos' element={<VideoLibraryPage/>}/>
                <Route path='/dashboard/notes' element={<NotesPage/>}/>
                <Route path='/dashboard/notes/:noteId' element={<UserNoteDetailPage />} />
                <Route path='/dashboard/assignments' element={<StudentAssignmentsPage />} />
                <Route path='/dashboard/assignments/:id' element={<StudentAssignmentDetailPage />} />

              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
