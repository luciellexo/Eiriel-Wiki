import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useDoseStore } from '../../store/useDoseStore';
import { getActiveLogs } from '../../utils/substanceUtils';
import { formatDistanceToNow, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { logs, removeLog, updateLog } = useDoseStore();
  const [activeLogs, setActiveLogs] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const active = getActiveLogs(logs, {});
    setActiveLogs(active);
    setHistoryLogs(logs.filter(l => !active.includes(l)).sort((a, b) => b.timestamp - a.timestamp));
  }, [logs, now]);

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setEditAmount(String(log.amount));
    setEditNotes(log.notes || '');
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (editingLog) {
      updateLog(editingLog.id, {
        amount: parseFloat(editAmount) || editingLog.amount,
        notes: editNotes
      });
      setEditModalVisible(false);
      setEditingLog(null);
    }
  };

  const renderActiveItem = ({ item }: { item: any }) => {
    const startTime = item.timestamp;
    const duration = (item.estimatedDurationMinutes || 240) * 60 * 1000;
    const endTime = startTime + duration;
    const timeLeft = endTime - now;
    const progress = Math.max(0, Math.min(100, (1 - timeLeft / duration) * 100));

    return (
      <TouchableOpacity style={styles.activeCard} onPress={() => handleEdit(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.substanceName}>{item.substanceName}</Text>
          <TouchableOpacity onPress={() => {
              Alert.alert('Delete Log', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => removeLog(item.id) }
              ]);
          }}>
             <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.doseDetail}>{item.amount} {item.unit} via {item.roa}</Text>
        
        <View style={styles.timerContainer}>
           <Text style={styles.timerText}>
              Active for {formatDistanceToNow(item.timestamp)}
           </Text>
           <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
           </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleEdit(item)}>
       <View>
         <Text style={styles.historyName}>{item.substanceName}</Text>
         <Text style={styles.historyDetail}>
             {item.amount} {item.unit} • {format(item.timestamp, 'MMM d, h:mm a')}
         </Text>
         {item.notes ? <Text style={styles.historyNotes} numberOfLines={1}>{item.notes}</Text> : null}
       </View>
       <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.timeAgo}>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</Text>
          <Ionicons name="chevron-forward" size={16} color="#444" style={{marginLeft: 8}} />
       </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Substances</Text>
        {activeLogs.length === 0 ? (
          <Text style={styles.emptyText}>No active substances</Text>
        ) : (
          <FlatList
            data={activeLogs}
            renderItem={renderActiveItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <View style={[styles.section, { flex: 1 }]}>
        <Text style={styles.sectionTitle}>History</Text>
        <FlatList
          data={historyLogs}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No history yet.</Text>}
        />
      </View>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Log</Text>
                
                <Text style={styles.label}>Amount</Text>
                <TextInput 
                    style={styles.input} 
                    value={editAmount} 
                    onChangeText={setEditAmount}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Notes</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    value={editNotes} 
                    onChangeText={setEditNotes}
                    multiline
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveEdit}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => {
                        Alert.alert('Delete', 'Are you sure?', [
                            { text: 'Cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => {
                                removeLog(editingLog.id);
                                setEditModalVisible(false);
                            }}
                        ]);
                    }}
                >
                    <Text style={styles.deleteText}>Delete Entry</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#BB86FC', marginBottom: 12 },
  emptyText: { color: '#666', fontStyle: 'italic' },
  activeCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 250,
    borderLeftWidth: 4,
    borderLeftColor: '#03DAC6'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  substanceName: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  doseDetail: { color: '#ccc', fontSize: 14, marginBottom: 12 },
  timerContainer: { marginTop: 8 },
  timerText: { color: '#03DAC6', fontSize: 12, marginBottom: 4 },
  progressBarBg: { height: 4, backgroundColor: '#333', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: '#03DAC6', borderRadius: 2 },
  historyItem: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyName: { color: '#fff', fontSize: 16, fontWeight: '500' },
  historyDetail: { color: '#888', fontSize: 12, marginTop: 4 },
  historyNotes: { color: '#666', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  timeAgo: { color: '#555', fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#888', marginBottom: 8 },
  input: { backgroundColor: '#2C2C2C', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  cancelButton: { backgroundColor: '#333' },
  saveButton: { backgroundColor: '#03DAC6' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { marginTop: 20, alignItems: 'center' },
  deleteText: { color: '#CF6679' }
});
