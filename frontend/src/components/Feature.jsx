import React, { useState, useEffect } from 'react';
import './feature.css'; // Update with correct path
import masc from '../assets/logoDump/mascotNoBG.png'; // Ensure these paths are correct
import { quantum } from 'ldrs';

quantum.register();

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
  const [curGuess, setCurGuess] = useState(false);
  const [showQuizCreation, setShowQuizCreation] = useState(false); 
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [idkybutitworks, setidkybutitworks] = useState(true);
  const [begin, setBegin] = useState(true);

  const handleFileSelect = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  useEffect(() => {
    if (selectedOption !== null) {
      const timer = setTimeout(() => {
        if (currentQuestion < numQuestions) {
          setCurrentQuestion(current => current + 1);
          setSelectedOption(null);
          setCurGuess(false);
        } else {
          setShowFinalScore(true);
          setQuizPopulated(false);
          setQuizStarted(false);
        }
      }, 3000); // Show result for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [selectedOption, quizQuestions, currentQuestion, numQuestions]);

  const handleGenerateClick = async (event) => {
    setLoading(true); // Start loading
    setBegin(false);
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
    console.log("Fetching summary flashcards");
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
      alert('Unable to create summary, try again!');
      setLoading(false); // Ensure loading is false on error as well
      setBegin(true);
    });

    setQuizStarted(true);
    setCurTop(topicName);
    setTopicName('');
  };


  const handleQuizStart = async () => {
    setQuizLoading(true);
    setidkybutitworks(false);
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

  const handleAnswerSelect = (optionKey) => {
    setSelectedOption(optionKey);
    const isCorrect = quizQuestions[currentQuestion - 1].answer === optionKey;
    if (isCorrect && !curGuess) {
      setCurrentScore(currentScore + 1);
    }
    setCurGuess(true);
  };

  const resetQuiz = () => {
    setQuizStarted(true);
    setQuizPopulated(false);
    setShowFinalScore(false);
    setCurrentQuestion(1);
    setCurrentScore(0);
    setShowQuizCreation(false);
    setCurGuess(false);
    setSelectedOption()
    setQuizQuestions([]);
    setNumQuestions(0);
    setSelectedOption(null)
    setidkybutitworks(true);
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

        {begin && (
          <div className="api-output loading-container m-4">
            <l-quantum size="100" speed="1.75" color="DodgerBlue" />
            <p className='loading-text m-4'>
              <span className='typing-effect-slower'>Click 'Upload Files' and get started!</span>
            </p>
            <img src={masc} alt="Mascot" className="mascot" />
          </div>
        )}

        

        {!begin && loading && (
          <div className="api-output loading-container">
            <l-quantum size="100" speed="1.75" color="DodgerBlue" />
            <p className='loading-text'>
              <span className='typing-effect'>Your buddy is working... &nbsp;</span>
            </p>
            <img src={masc} alt="Mascot" className="mascot" />
          </div>
        )}

        {!begin && !loading && msg && (
          <div className="api-output">
            {Object.entries(msg).map(([key, value], index) => (
              <div key={index} className='flash-card-container'>
                <h2 className='flash-card-header'>{formatKey(key)}</h2>
                <p className='flash-card-definition'>{value}</p>
                <img src={masc} alt="Mascot" className="mascot" />
              </div>
            ))}
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

        {showFinalScore && (
          <div className="api-output-final-score loading-container">
            <p className='loading-text'>
              <span className='typing-effect'>Final Score: &nbsp; {currentScore}/{numQuestions}</span>
            </p>
            <button onClick={resetQuiz} className="file-upload-label">Close Quiz Window</button>
          </div>
        )}

        {idkybutitworks && !showFinalScore && quizStarted && !loading && (
          <div className={`animated-section visible`}>

            <div className="quiz-trigger">
              <h2 style={{ color: '#1a8cd8', fontSize: '1.3rem', fontWeight: 'bold', paddingLeft: '75px'}}>{!showQuizCreation ?  'Up For A ' : 'Not Feeling It?'}<span className='suga2'>{!showQuizCreation ? 'Challenge?' : ''}</span></h2>
              <button onClick={() => setShowQuizCreation(!showQuizCreation)} className="file-upload-label">
              {showQuizCreation ? 'Nevermind, No Quiz' : 'Create A Quiz'}
              </button>
            </div>
          </div>
        )}
        {!showFinalScore && showQuizCreation && !quizPopulated && !quizLoading && (
          <div className={`animated-section visible`}>
            <div className="input-section">
              <label htmlFor="numQuestions">How many questions?</label>
              <input type="number" id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} placeholder="0" />
              <button className="file-upload-label" onClick={handleQuizStart}>Generate</button>
            </div>
          </div>
        )}

        {quizLoading && (
              <div className="api-output loading-container">
                <l-quantum size="100" speed="1.75" color="DodgerBlue" />
                <p className='loading-text'>
                  <span className='typing-effect'>Lets see what you know... &nbsp;</span>
                </p>
              </div>
        )}
        
        {quizPopulated && !showFinalScore ? (
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
                      className={`answer-option 
                        ${selectedOption === optionKey ? 'selected' : ''} 
                        ${quizQuestions[currentQuestion - 1].answer === optionKey ? 'correct' : ''}
                        ${selectedOption === optionKey && quizQuestions[currentQuestion - 1].answer !== optionKey ? 'incorrect' : ''}
                      `}>
                        {optionKey}: {optionValue}
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
