import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { quizAPI } from '../../src/services/api';
import { COLORS } from '../../src/theme/colors';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQuiz(); }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await quizAPI.getOne(id);
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(-1));
    } catch (error) { Alert.alert('Error', 'Failed to load quiz'); } finally { setLoading(false); }
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
        { text: 'Cancel' }, { text: 'Submit', onPress: submitQuiz },
      ]);
    } else { submitQuiz(); }
  };

  const submitQuiz = async () => {
    try {
      const formattedAnswers = answers.map((selectedAnswer, index) => ({ questionIndex: index, selectedAnswer }));
      const res = await quizAPI.submit(id, formattedAnswers);
      setResult(res.data);
      setSubmitted(true);
    } catch (error) { Alert.alert('Error', error.response?.data?.message || 'Failed to submit quiz'); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!quiz) return <View style={styles.center}><Text>Quiz not found</Text></View>;

  if (result) {
    const passed = result.score >= quiz.passingScore;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultCard}>
          <Ionicons name={passed ? 'checkmark-circle' : 'close-circle'} size={80} color={passed ? COLORS.success : COLORS.danger} />
          <Text style={[styles.resultTitle, { color: passed ? COLORS.success : COLORS.danger }]}>{passed ? 'Congratulations!' : 'Keep Practicing!'}</Text>
          <Text style={styles.resultScore}>{result.score}%</Text>
          <Text style={styles.resultText}>{result.correctAnswers} out of {quiz.questions.length} correct</Text>
          <Text style={styles.passingText}>Passing score: {quiz.passingScore}%</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
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
          <TouchableOpacity key={index} style={[styles.optionButton, answers[currentQuestion] === index && styles.optionActive]}
            onPress={() => handleAnswer(index)}>
            <View style={[styles.optionCircle, answers[currentQuestion] === index && styles.optionCircleActive]}>
              <Text style={[styles.optionLetter, answers[currentQuestion] === index && styles.optionLetterActive]}>{String.fromCharCode(65 + index)}</Text>
            </View>
            <Text style={[styles.optionText, answers[currentQuestion] === index && styles.optionTextActive]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={() => setCurrentQuestion(currentQuestion - 1)}>
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentQuestion < quiz.questions.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentQuestion(currentQuestion + 1)}>
            <Text style={styles.nextButtonText}>Next</Text>
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
  progressText: { fontSize: 14, color: COLORS.gray[600], marginBottom: 8, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: COLORS.gray[200], borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  questionCard: { margin: 16, padding: 20, backgroundColor: COLORS.white, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  questionText: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 20, lineHeight: 26 },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, marginBottom: 12 },
  optionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  optionCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: COLORS.gray[300], justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionCircleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionLetter: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray[500] },
  optionLetterActive: { color: COLORS.white },
  optionText: { flex: 1, fontSize: 15, color: COLORS.gray[700] },
  optionTextActive: { color: COLORS.primary, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  prevButton: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[300], flex: 1, marginRight: 8, alignItems: 'center' },
  prevButtonText: { color: COLORS.gray[600], fontSize: 16, fontWeight: '600' },
  nextButton: { padding: 16, borderRadius: 12, backgroundColor: COLORS.primary, flex: 1, marginLeft: 8, alignItems: 'center' },
  nextButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  submitButton: { padding: 16, borderRadius: 12, backgroundColor: COLORS.success, flex: 1, marginLeft: 8, alignItems: 'center' },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  resultCard: { margin: 16, padding: 32, backgroundColor: COLORS.white, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  resultText: { fontSize: 16, color: COLORS.gray[600], marginBottom: 4 },
  passingText: { fontSize: 14, color: COLORS.gray[400], marginBottom: 24 },
  doneButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  doneButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
