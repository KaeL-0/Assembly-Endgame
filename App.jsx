import { useState, useEffect } from "react"
import clsx from 'clsx'
import { languages } from './languages'
import { getFarewellText, getRandomWord } from "./utils"
import { useWindowSize } from "react-use"
import Confetti from "react-confetti"


export default function App() {

    //Constant values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"
    const {width, height} = useWindowSize()

    //State values
    const [currentWord, setCurrentWord] = useState(()=> getRandomWord())
    const [guessedLetters, setGuessedLetters] = useState([])

    //Derive values
    const currentWordArr = currentWord.split('')
    const keyboardArr = alphabet.split('')

    const wrongGuessCount = guessedLetters.reduce( (incorrect, guess) => {
        return !currentWordArr.includes(guess) ? incorrect + 1 : incorrect
    }, 0)

    const isGameWon = currentWordArr.every(item => guessedLetters.includes(item))
    const isGameLost = wrongGuessCount >= (languages.length - 1)
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetters = guessedLetters[guessedLetters.length - 1]
    const islastGuessIncorrect = guessedLetters.length && !currentWordArr.includes(lastGuessedLetters)

    const numGuessesLeft = (languages.length - 1) - wrongGuessCount

    const languageElements = languages.map( (item, index) => {
        const styles = {
            backgroundColor: item.backgroundColor,
            color: item.color
        }
        const isLost = index < wrongGuessCount
        const className = clsx('chips', isLost && 'chips-lost' )

        return <span key={item.name} style={styles} 
            className={className}
            >{item.name}</span>
    })
    
    const currentWordElements = currentWordArr.map( (item, index)=> {
        const shouldRevealLetter = isGameLost || guessedLetters.includes(item)
        const letterClassName = clsx('word', { failed: !guessedLetters.includes(item) && isGameLost })
        
        return (
            <span key={index} className={letterClassName}
            >{ shouldRevealLetter && item.toUpperCase() }</span>
        )
    })

    const keyboardElements = keyboardArr.map(item => (
        <button key={item} 
            disabled={isGameOver}
            aria-disabled={guessedLetters.includes(item)}
            aria-label={`Letters ${item}`}
            className={clsx(
            'keyboard', 
            guessedLetters.includes(item) ?
            (currentWordArr.includes(item) ? 'keyboard-correct': 'keyboard-wrong') : null
            )}
        >{item.toUpperCase()}</button>
    ))
    
    //Functions
    function saveGuessedLetters(event) {
        if(event.target.tagName === 'BUTTON'){
            setGuessedLetters(arr => (
                arr.includes(event.target.textContent.toLowerCase()) ? arr : [...arr, event.target.textContent.toLowerCase()]
            ))
        }

    }

    function startNewGame() {
        setCurrentWord(getRandomWord())
        setGuessedLetters([])
    }

    //Styles

    const statusClassName = clsx('status-page', {
        won: isGameWon,
        lose: isGameLost,
        farewell: !isGameOver && islastGuessIncorrect
    })

    function StatusPage() {

        if(!isGameOver && islastGuessIncorrect){
            return <>
            <p>{`”${getFarewellText(languages[wrongGuessCount - 1].name)}” `}</p>
            </>
        }

        return <>
            <h2>{isGameWon ? 'You win!' : 'Game Over!'}</h2>
            <p>{isGameWon ? 'Well done! 🎉' : 'You lose! Better start learning Assembly 😭!'}</p>
        </>
    }

    function ScreenReaderOnly() {
        return (
            <section 
                className="sr-only" 
                aria-live="polite" 
                role="status"
            >

                <p>
                    {currentWord.includes(lastGuessedLetters) ? 
                        `Correct! The letter ${lastGuessedLetters} is in the word.` : 
                        `Sorry, the letter ${lastGuessedLetters} is not in the word.`
                    }
                    You have {numGuessesLeft} attempts left.
                </p>

                <p>Current word: {currentWord.split("").map(letter => 
                guessedLetters.includes(letter) ? letter + "." : "blank.")
                .join(" ")}</p>
            
            </section>
        )
    }

    return (
        <main>
            <header>
                <h1 className='title'>Assembly: Endgame</h1>
                <p className='instruction'>Guess the word in under 8 attempts to keep the programming world safe from Assembly!</p>
            </header>
            <section aria-live='polite' role='status' className={statusClassName}>
                <StatusPage />
            </section>
            <section className='languages'>{languageElements}</section>

            {/* Combined visually-hidden aria-live region for status updates */}
            <ScreenReaderOnly />

            <section className='word-container'>{currentWordElements}</section>
            <section className='keyboard-container' onClick={saveGuessedLetters}>{keyboardElements}</section>
            { isGameOver && <button className="new-game" onClick={startNewGame}>New Game</button>}
            { isGameWon && <Confetti width={width} height={height} recycle={false} numberOfPieces={1000}/>}
        </main>
    )
}
