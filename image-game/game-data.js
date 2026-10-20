// Viewing duration and the supplied round questions/answers.
// Edit each question/answer pair here; scoring is discussed manually.
export const imageGame = {
  title: 'Image Memory',
  viewSeconds: 30,
  rounds: [
    {
      id: 'image-1', title: 'Image 1', src: './images/image1.jpg', alt: 'Memory image 1',
      questions: [
        { question: 'How many lit candles were in the image?', answer: '3' },
        { question: 'What was the color of the largest pumpkin?', answer: 'Orange' },
        { question: 'What was laid on top of the skull?', answer: 'Oak branch' },
        { question: 'What was in the background?', answer: 'Dark forest' },
        { question: 'What was the color of the doll’s shirt?', answer: 'White / Grey' }
      ]
    },
    {
      id: 'image-2', title: 'Image 2', src: './images/image2.jpg', alt: 'Memory image 2',
      questions: [
        { question: 'What was the color of the main character’s clothing?', answer: 'Blue / Purple / Brown' },
        { question: 'How many musical instruments were in the image?', answer: '3 types / 4 instruments' },
        { question: 'Which animal did the skull on the right belong to?', answer: 'Horse' },
        { question: 'How many wings did the figure on the left of the main character have?', answer: '2' },
        { question: 'On which side was the exit from the cave?', answer: 'Left' }
      ]
    },
    {
      id: 'image-3', title: 'Image 3', src: './images/image3.jpg', alt: 'Memory image 3',
      questions: [
        { question: 'How many people were depicted in the central portrait?', answer: '4' },
        { question: 'On which side of the crystal ball were the three books located?', answer: 'Right' },
        { question: 'What was the time on the clock in the center?', answer: '9:08' },
        { question: 'What was the color of the central portrait frame?', answer: 'Gold' },
        { question: 'How many candles were on the table?', answer: '14' }
      ]
    }
  ]
};
