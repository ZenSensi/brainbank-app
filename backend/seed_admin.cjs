const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const contentItems = [
  { title: "C Programming Notes", description: "Introduction to C Programming: variables, control statements, functions, arrays, pointers, and structures.", type: "notes", subjectId: "c-programming", subjectName: "C Programming", semester: 1, specialization: "cybersecurity", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "C Programming PYQ Solved", description: "Fully solved previous year university exam questions for C Programming.", type: "pyq", subjectId: "c-programming", subjectName: "C Programming", semester: 1, specialization: "cybersecurity", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "C Programming Video Course", description: "Learn C from scratch with step-by-step programming tutorials.", type: "video", subjectId: "c-programming", subjectName: "C Programming", semester: 1, specialization: "cybersecurity", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", youtubePlaylistId: "PLu0W_TdB5OBw4DPJwz56u8M4WY4b09mUM", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "HTML Complete Notes", description: "Complete HTML5 tutorial: tags, attributes, lists, tables, forms, and semantic elements.", type: "notes", subjectId: "html", subjectName: "HTML", semester: 1, specialization: "web-dev", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "HTML Solved Exam PYQ", description: "HTML structure-based previous year questions solved with examples.", type: "pyq", subjectId: "html", subjectName: "HTML", semester: 1, specialization: "web-dev", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "HTML Web Design Playlist", description: "Video course on building web pages using correct HTML semantic structure.", type: "video", subjectId: "html", subjectName: "HTML", semester: 1, specialization: "web-dev", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713", youtubePlaylistId: "PLu0W_TdB5OBw4DPJwz56u8M4WY4b09mUM", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "CSS Stylesheet Notes", description: "Comprehensive CSS styling: selectors, box-model, Flexbox, Grid, animations, and responsive web design.", type: "notes", subjectId: "css", subjectName: "CSS", semester: 1, specialization: "web-dev", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "CSS Layouts PYQ", description: "Solved exam papers focusing on CSS styling, layouts, and responsive properties.", type: "pyq", subjectId: "css", subjectName: "CSS", semester: 1, specialization: "web-dev", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "JavaScript Complete Notes", description: "Learn ES6 syntax, variables, scope, closures, DOM manipulation, asynchronous programming, and APIs.", type: "notes", subjectId: "javascript", subjectName: "JavaScript", semester: 2, specialization: "web-dev", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "JavaScript Solved PYQs", description: "DOM manipulation and JavaScript logic solved exam papers.", type: "pyq", subjectId: "javascript", subjectName: "JavaScript", semester: 2, specialization: "web-dev", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "JS Interactive Web Playlist", description: "Complete JavaScript video tutorials from basics to DOM scripting.", type: "video", subjectId: "javascript", subjectName: "JavaScript", semester: 2, specialization: "web-dev", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a", youtubePlaylistId: "PLu0W_TdB5OBw4DPJwz56u8M4WY4b09mUM", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Git & GitHub Guide Notes", description: "Version control: committing, branching, merging, conflict resolution, pull requests, and remote repositories.", type: "notes", subjectId: "git-github", subjectName: "GitHub/Git", semester: 2, specialization: "cloud", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Git & GitHub Solved PYQ", description: "Questions on git command workflows and branching models.", type: "pyq", subjectId: "git-github", subjectName: "GitHub/Git", semester: 2, specialization: "cloud", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Version Control Git Playlist", description: "Learn Git command line and GitHub hosting through these video tutorials.", type: "video", subjectId: "git-github", subjectName: "GitHub/Git", semester: 2, specialization: "cloud", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871", youtubePlaylistId: "PLu0W_TdB5OBw4DPJwz56u8M4WY4b09mUM", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Python Programming Notes", description: "Python basics: variables, data structures (lists, tuples, dicts), OOP, exceptions, and libraries (NumPy, Pandas).", type: "notes", subjectId: "python", subjectName: "Python", semester: 3, specialization: "ai-ml", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Python Solved Exam PYQ", description: "Python syntax, lists, strings, and programming design solved question papers.", type: "pyq", subjectId: "python", subjectName: "Python", semester: 3, specialization: "ai-ml", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Python for Beginners Video Series", description: "Comprehensive Python programming course covering scripting, object-oriented code, and projects.", type: "video", subjectId: "python", subjectName: "Python", semester: 3, specialization: "ai-ml", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", youtubePlaylistId: "PLu0W_TdB5OBw4DPJwz56u8M4WY4b09mUM", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "SQL & Relational Databases Notes", description: "Database designs: ER diagrams, Normalization (1NF, 2NF, 3NF), and SQL queries (joins, subqueries, grouping).", type: "notes", subjectId: "sql", subjectName: "SQL", semester: 3, specialization: "data-science", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "SQL Queries Solved PYQs", description: "Database systems solved university papers containing SQL query requests.", type: "pyq", subjectId: "sql", subjectName: "SQL", semester: 3, specialization: "data-science", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "SQL & Databases Video Tutorials", description: "Visual database design and SQL syntax training course.", type: "video", subjectId: "sql", subjectName: "SQL", semester: 3, specialization: "data-science", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d", youtubePlaylistId: "PL0b6OzZo8l3_K8j2P_2pD66A8CeaP9N4E", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Java Programming Notes", description: "Object-oriented design in Java: classes, inheritance, polymorphism, abstract methods, collections, and interfaces.", type: "notes", subjectId: "java", subjectName: "Java", semester: 4, specialization: "app-dev", price: 19, thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Java Programming Solved PYQ", description: "Solved exam questions for Core Java syntax and OOP architecture.", type: "pyq", subjectId: "java", subjectName: "Java", semester: 4, specialization: "app-dev", price: 29, thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isLocked: true, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { title: "Java OOP Complete Playlist", description: "Video series on learning Java structures and software design patterns.", type: "video", subjectId: "java", subjectName: "Java", semester: 4, specialization: "app-dev", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", youtubePlaylistId: "PLu0W_TdB5OBw4DPJwz56u8M4WY4b09mUM", isLocked: false, downloadCount: 0, createdAt: Date.now(), updatedAt: Date.now() },
];

async function seed() {
  const collectionRef = db.collection("content");
  console.log("Cleansing existing content...");
  const existing = await collectionRef.get();
  console.log(`Found ${existing.size} items. Deleting...`);
  const deletions = existing.docs.map(d => d.ref.delete());
  await Promise.all(deletions);
  console.log("Cleansing complete.");

  console.log("Seeding content...");
  for (const item of contentItems) {
    const docRef = await collectionRef.add(item);
    console.log(`Added: ${item.title} (${docRef.id})`);
  }
  console.log(`Seeded ${contentItems.length} items successfully!`);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
