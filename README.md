```latex
\documentclass[a4paper,10pt]{article}

\usepackage[T1]{fontenc}
\usepackage{latexsym}
\usepackage{microtype}
\usepackage[margin=0.55in]{geometry}
\usepackage{enumitem}
\usepackage[colorlinks=true,urlcolor=black]{hyperref}
\usepackage{titlesec}
\usepackage{amssymb}

% ---------- Global Formatting ----------
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\linespread{1.0}
\urlstyle{same}

\titleformat{\section}
  {\normalsize\bfseries}
  {}{0em}{}[\titlerule]

\titlespacing*{\section}{0pt}{6pt}{3pt}

\setlist[itemize]{
    leftmargin=12pt,
    itemsep=1pt,
    topsep=2pt,
    parsep=0pt,
    partopsep=0pt
}

\begin{document}

% =======================
% HEADER
% =======================
\begin{center}
    {\fontsize{28}{31}\selectfont\scshape Ark Gupta}\\[3pt]
    \small
    (+91) 6393807748 \quad\textbar\quad
    \href{mailto:arkgupta17@gmail.com}{arkgupta17@gmail.com}
    \quad\textbar\quad
    \href{https://www.linkedin.com/in/ark-gupta-iiitn27}{LinkedIn}
    \quad\textbar\quad
    \href{https://github.com/arkgupta17}{GitHub}
    \quad\textbar\quad
    \href{https://leetcode.com/u/ark_gupta03/}{LeetCode}
\end{center}

\vspace{-5pt}

% =======================
\section*{Technical Skills}

\textbf{Languages:} C++, Python, JavaScript, TypeScript, SQL\\
\textbf{Backend \& Frameworks:} Node.js, Express.js, FastAPI, React.js, Next.js, REST APIs\\
\textbf{Databases \& Infrastructure:} PostgreSQL, MySQL, MongoDB, Redis, Docker, BullMQ\\
\textbf{AI \& Machine Learning:} Scikit-learn, FAISS, Sentence Transformers, TensorFlow, PyTorch\\
\textbf{Tools:} Git, GitHub, Playwright, Linux, Postman

% =======================
\section*{Projects}

\textbf{\href{https://github.com/arkgupta17/zenness-fullstack-mental-health-app}{Zenness: AI-Powered Mental Health Assessment Platform}}
\href{https://zenness.vercel.app}{[Live]}
\hfill {\small\textit{Next.js, FastAPI, SQLAlchemy, JWT, Scikit-learn}}

\begin{itemize}
    \item Built a full-stack stress assessment platform using \textbf{Next.js, FastAPI}, and a \textbf{22-feature SVM pipeline}, with JWT authentication and personalized wellness recommendations.
    \item Optimized an \textbf{SVM classifier} on $\sim$1,100 samples, achieving \textbf{91.89\% accuracy} against a \textbf{34.24\% baseline} through behavioral and health-risk feature engineering.
    \item Developed \textbf{REST APIs} and assessment-history dashboards using \textbf{SQLAlchemy and SQLite}; deployed on \textbf{Vercel and Render} with $\sim$262 ms average inference latency.
\end{itemize}

\vspace{2pt}

\textbf{\href{https://github.com/arkgupta17/EduPilot-V2}{EduPilot: AI Knowledge Engine}}
\hfill {\small\textit{Next.js, FastAPI, Python, Playwright, FAISS, Sentence Transformers, Groq API}}

\begin{itemize}
    \item Built a full-stack \textbf{RAG platform} for websites and documents, indexing \textbf{1,443 chunks} from \textbf{148 pages} across \textbf{15+ institutions}.
    \item Developed a \textbf{Playwright crawler} for JavaScript-rendered sites and a document-ingestion pipeline for PDF, DOCX, and HTML sources.
    \item Engineered hybrid retrieval combining \textbf{semantic similarity, lexical matching, and section relevance}, with query rewriting and source filtering for cited, evidence-grounded answers.
\end{itemize}

\vspace{2pt}

\textbf{Tessera: Event-Driven Backend System}
\hfill {\small\textit{Node.js, TypeScript, PostgreSQL, Redis, BullMQ, Docker}}

\begin{itemize}
    \item Built an event-driven \textbf{REST API} with PostgreSQL transactions and idempotent ingestion, atomically persisting events and outbox records to prevent duplicate processing.
    \item Implemented the \textbf{Transactional Outbox Pattern} with \textbf{Redis and BullMQ}, enabling asynchronous processing, exponential-backoff retries, lifecycle tracking, and stale-event recovery.
    \item Containerized \textbf{6 services with Docker Compose}, configuring persistent PostgreSQL storage, Redis health checks, and independent workers; verified event processing and recovery across container recreation.
\end{itemize}

% =======================
\section*{Open Source Contributions}

\textbf{JuliaLang Ecosystem (JuliaLang, DataFrames.jl)}
\hfill \textit{Dec 2025 -- Present}

\begin{itemize}[itemsep=0pt,topsep=1pt]
    \item Refactored \textbf{JuliaLang/julia}'s README (\#60443; 48k\(\star\)), adding a dedicated \textbf{Contributing} section to streamline onboarding and contribution workflows -- \textbf{merged} into master.
    \item Fixed invalid indexing in \textbf{DataFrames.jl} (\#3522) for \textbf{SubDataFrame} transformations with \texttt{copycols=false}, improving selection error handling based on maintainer feedback -- \textbf{merged} into master.
\end{itemize}

% =======================
\section*{Education}

\textbf{Indian Institute of Information Technology, Nagpur}
\hfill Aug 2023 -- Present\\[-1pt]
B.Tech in Computer Science \& Engineering (Data Science and Analytics)

\vspace{3pt}

\textbf{Immaculate Conception Convent School, Lucknow}
\hfill 2020 -- 2022\\[-1pt]
Senior Secondary (Class XII -- ICSE)
\hfill \textbf{94\%}

% =======================
\section*{Achievements \& Certifications}

\begin{itemize}[itemsep=0pt,topsep=1pt]
    \item \textbf{2nd Runner-Up} -- Masters' Union Hackathon, XPECTO'26 (IIT Mandi)
    \item \textbf{Competitive Programming:} 350+ LeetCode problems; peak rating \textbf{1598}.
    \item \textbf{OCI AI Foundations Associate} -- Oracle \hfill \textit{Feb 2026}
    \item \textbf{API Fundamentals Student Expert} -- Postman \hfill \textit{Mar 2026}
    \item \textbf{Fundamentals of Deep Learning} -- NVIDIA \hfill \textit{Mar 2026}
\end{itemize}

% =======================
\section*{Relevant Coursework}

\textbf{Core CS:} DSA, OOP, Operating Systems, DBMS, Computer Networks, Foundations of Computing\\
\textbf{AI \& Data Science:} Artificial Intelligence, Machine Learning, Deep Learning, Data Visualization, Big Data Analytics

\end{document}
```
