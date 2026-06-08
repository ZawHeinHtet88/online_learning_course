import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { quizAPI } from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function QuizScreen({ route, navigation }) {
  const { quizId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await quizAPI.getOne(quizId);
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(-1));
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a === -1).length;
    if (unanswered > 0) {
      Alert.alert('Warning', `You have ${unanswered} unanswered questions. Submit anyway?`, [
        { text: 'Cancel' },
        { text: 'Submit', onPress: submitQuiz },
      ]);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const formattedAnswers = answers.map((selectedAnswer, index) => ({ questionIndex: index, selectedAnswer }));
      const res = await quizAPI.submit(quizId, formattedAnswers);
      setResult(res.data);
      setSubmitted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit quiz');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!quiz) {
    return <View style={styles.center}><Text>Quiz not found</Text></View>;
  }

  if (submitted && result) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultCard}>
          <Ionicons name={result.passed ? 'checkmark-circle' : 'close-circle'} size={80} color={result.passed ? COLORS.success : COLORS.danger} />
          <Text style={styles.resultTitle}>{result.passed ? 'Congratulations!' : 'Keep Learning!'}</Text>
          <Text style={styles.resultMessage}>{result.passed ? 'You passed the quiz!' : 'You did not pass. Review the material and try again.'}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Your Score</Text>
            <Text style={[styles.scoreNumber, { color: result.passed ? COLORS.success : COLORS.danger }]}>{result.score}%</Text>
            <Text style={styles.passingScore}>Passing: {quiz.passingScore}%</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to Course</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>Question {currentQuestion + 1} of {quiz.questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.options.map((option, index) => (
          <TouchableOpacity key={index} style={[styles.optionButton, answers[currentQuestion] === index && styles.optionSelected]} onPress={() => handleAnswer(index)}>
            <View style={[styles.optionCircle, answers[currentQuestion] === index && styles.optionCircleSelected]}>
              <Text style={[styles.optionLetter, answers[currentQuestion] === index && styles.optionLetterSelected]}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.optionText, answers[currentQuestion] === index && styles.optionTextSelected]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]} onPress={() => setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0}>
          <Ionicons name="chevron-back" size={20} color={currentQuestion === 0 ? COLORS.gray[400] : COLORS.primary} />
          <Text style={[styles.navButtonText, currentQuestion === 0 && { color: COLORS.gray[400] }]}>Previous</Text>
        </TouchableOpacity>

        {currentQuestion < quiz.questions.length - 1 ? (
          <TouchableOpacity style={styles.navButtonRight} onPress={() => setCurrentQuestion(currentQuestion + 1)}>
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Quiz</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressHeader: { padding: 16, backgroundColor: COLORS.white },
  progressText: { fontSize: 14, color: COLORS.gray[600], marginBottom: 8, textAlign: 'center' },
  progressBar: { height: 6, backgroundColor: COLORS.gray[200], borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  questionCard: { margin: 16, padding: 20, backgroundColor: COLORS.white, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  questionText: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 20, lineHeight: 26 },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, marginBottom: 12 },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  optionCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: COLORS.gray[300], justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionCircleSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionLetter: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray[500] },
  optionLetterSelected: { color: COLORS.white },
  optionText: { flex: 1, fontSize: 15, color: COLORS.gray[700] },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  navButton: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  navButtonRight: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  navButtonDisabled: { opacity: 0.5 },
  navButtonText: { fontSize: 16, color: COLORS.primary, fontWeight: '600', marginHorizontal: 4 },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  resultCard: { margin: 16, padding: 24, backgroundColor: COLORS.white, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginTop: 16, marginBottom: 8 },
  resultMessage: { fontSize: 14, color: COLORS.gray[500], textAlign: 'center', marginBottom: 24 },
  scoreContainer: { alignItems: 'center', marginBottom: 24 },
  scoreText: { fontSize: 14, color: COLORS.gray[500] },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', marginTop: 8 },
  passingScore: { fontSize: 12, color: COLORS.gray[400], marginTop: 4 },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
