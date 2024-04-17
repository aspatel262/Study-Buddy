import React, { useState } from 'react';
import './feature.css'; // Update with correct path
import CountUp from 'react-countup';
import masc from '../assets/logoDump/mascotNoBG.png'; // Ensure these paths are correct
import { quantum } from 'ldrs';

quantum.register();

function Testimonial({ quote, author, authorImageSrc }) {
  return (
    <div className="testimonial">
      <p className="testimonial-quote">"{quote}"</p>
      <div className="testimonial-author">
        <img src={authorImageSrc} alt={author} className="testimonial-image" />
        <footer className="testimonial-name">- {author}</footer>
      </div>
    </div>
  );
}

function Statistic({ value, decimals, suffix, label }) {
  const handleMouseOver = (e) => {
    e.target.style.transform = 'scale(1.1)';
  };

  const handleMouseOut = (e) => {
    e.target.style.transform = 'scale(1)';
  };

  return (
    <div className="statistic" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <div className="statistic-number">
        <CountUp end={value} duration={2.5} decimals={decimals} preserveValue suffix={suffix} />
      </div>
      <p className="statistic-label">{label}</p>
    </div>
  );
}

function Figure() {
  const [files, setFiles] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizPopulated, setQuizPopulated] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [numQuestions, setNumQuestions] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [curTop, setCurTop] = useState('')
  const [wantQuiz, setWantQuiz] = useState(false);

  const handleFileSelect = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  const handleGenerateClick = async (event) => {
    setLoading(true); // Start loading
    handleMsg(event); // You need to convert handleMsg into an async function or chain it properly with promises.
  };

  const handleMsg = (event) => {
    event.preventDefault();
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("file", file); // Use the same name 'file' for all files
    });
    formData.append("topic", topicName);
    // Add other form data as needed
    fetch("http://127.0.0.1:5000/process_summary", {
      method: "POST",
      body: formData,     
      crossorigin: true,
    })
    .then(response => response.json())
    .then(data => {
      setMsg(data.Summary); // Update the msg state
      setLoading(false); // Loading is done
    })
    .catch(error => {
      console.error('Error:', error);
      setLoading(false); // Ensure loading is false on error as well
    });

    setQuizStarted(true);
    setCurTop(topicName);
    setTopicName('');
  };


  const handleQuizStart = async () => {
    setQuizLoading(true);
    try {
      const url = new URL('http://127.0.0.1:5000/process_quiz');
      url.searchParams.append('amt', numQuestions); // Ensure numQuestions is a valid integer
      url.searchParams.append('topic', curTop); // Ensure topicName is a non-empty string
  
      console.log(`Making request to: ${url.toString()}`); // Debugging output
  
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // More informative error
      }
  
      const data = await response.json();
      setQuizQuestions(data.Questions);
      setNumQuestions(data.Questions.length);
      setCurrentQuestion(1);
      setCurrentScore(0);
      setQuizPopulated(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {}
    setQuizLoading(false);
  };
  
  const handleAnswerSelect = (selectedChoice) => {
    const currentQuizQuestion = quizQuestions[currentQuestion - 1];
    if (selectedChoice === currentQuizQuestion.answer && currentQuestion <= numQuestions) {
      setCurrentScore(currentScore + 1);
    }
    if (currentQuestion < numQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Handle the end of the quiz
    }
  };

  const formatKey = (key) => {
    return key.replace(/ _/g, ' ')
  };
    
  return (
    <div className="figure-component">
      <div className="content-box">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center'}}>
          Send us your study material,{" "}<span className='suga'>we'll help from here...</span>
        </h1>

        {loading ? (
          <div className="api-output loading-container">
            <l-quantum size="100" speed="1.75" color="DodgerBlue" />
            <p className='loading-text'>
              <span className='typing-effect'>Your buddy is working... &nbsp;</span>
            </p>
            <img src={masc} alt="Mascot" className="mascot" />
          </div>
        ) : (
          <div className="api-output">
            {msg ? (
              Object.entries(msg).map(([key, value], index) => (
                <div key={index} className='flash-card-container'>
                  <h2 className='flash-card-header'>{formatKey(key)}</h2>
                  <p className='flash-card-definition'>{value}</p>
                  <img src={masc} alt="Mascot" className="mascot" />
                </div>
              ))
            ) : (
              <img src={masc} alt="Mascot" className="mascot" />
            )}
          </div>
        )}
        
        <div className="input-section">
          <form onSubmit={handleGenerateClick} className="upload-form">
            <div className="file-input-wrapper">
              <label htmlFor="file-upload" className="file-upload-label">Choose Files</label>
              <input id="file-upload" type="file" multiple onChange={handleFileSelect} />
              <span className="file-selected">{files.length === 1 ? files[0].name : (files.length > 1 ? `${files.length} files selected` : 'No files selected')}</span>
            </div>
            <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="Topic Name" className="topic-name-input" />
            <button type="submit" className="file-upload-label">Generate</button>
          </form>
        </div>

        {quizStarted && !loading && (
          <div className={`animated-section visible`}>
            <h2 style={{ color: '#1a8cd8', fontSize: '1.3rem', fontWeight: 'bold', paddingLeft: '75px'}}>
              Ready to <span className='suga2'>practice</span>? Let's create a quiz!
            </h2>
            <div className="input-section">
              <label htmlFor="numQuestions">How many questions?</label>
              <input type="number" id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} placeholder="0" />
              <button className="file-upload-label" onClick={handleQuizStart}>Generate</button>
            </div>
          </div>
        )}

        {quizPopulated ? (
          <div className="animated-section visible">
            {quizLoading ? (
              <div className="api-output loading-container">
                <l-quantum size="100" speed="1.75" color="DodgerBlue" />
                <p className='loading-text'>
                  <span className='typing-effect'>Lets see what you know... &nbsp;</span>
                </p>
              </div>
            ) : (
              <div className="quiz-output-box">
                <div className="score-and-question-container">
                  <div className="score-bubble">Score: {currentScore}/{quizQuestions.length} Correct</div>
                  <div className="question-number-bubble">Question Progress: {currentQuestion}/{quizQuestions.length}</div>
                </div>

                <div className='question-container'>
                  <h2 className='question-text'>{quizQuestions[currentQuestion - 1].question}</h2>
                </div>

                <div className='answers-container'>
                  {Object.entries(quizQuestions[currentQuestion - 1].options).map(([optionKey, optionValue]) => (
                    <button 
                      key={optionKey} 
                      onClick={() => handleAnswerSelect(optionKey)}
                      className='answer-option'>
                      {`${optionKey}: ${optionValue}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Figure;