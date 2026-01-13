import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { useDoseStore } from '../../store/useDoseStore';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { logs, clearLogs, favorites } = useDoseStore();

  const handleExport = async () => {
    const data = JSON.stringify(logs, null, 2);
    await Clipboard.setStringAsync(data);
    Alert.alert('Success', 'Logs copied to clipboard!');
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            clearLogs();
            Alert.alert('Cleared', 'All logs have been deleted.');
          }
        }
      ]
    );
  };

  const openLink = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  // Stats
  const totalLogs = logs.length;
  const uniqueSubstances = new Set(logs.map(l => l.substanceName)).size;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Doses Logged</Text>
          <Text style={styles.statValue}>{totalLogs}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Unique Substances</Text>
          <Text style={styles.statValue}>{uniqueSubstances}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Favorites</Text>
          <Text style={styles.statValue}>{favorites.length}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.button} onPress={handleExport}>
          <Ionicons name="copy-outline" size={20} color="#000" style={styles.icon} />
          <Text style={styles.buttonText}>Export Logs (JSON to Clipboard)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClear}>
          <Ionicons name="trash-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harm Reduction Resources</Text>
        <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://psychonautwiki.org/')}>
           <Text style={styles.linkText}>PsychonautWiki</Text>
           <Ionicons name="open-outline" size={16} color="#BB86FC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://tripsit.me/')}>
           <Text style={styles.linkText}>TripSit</Text>
           <Ionicons name="open-outline" size={16} color="#BB86FC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://dancesafe.org/')}>
           <Text style={styles.linkText}>DanceSafe</Text>
           <Ionicons name="open-outline" size={16} color="#BB86FC" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
         <Text style={styles.disclaimer}>
            Disclaimer: This app is for harm reduction and educational purposes only. It does not encourage illegal activity. Always research before use.
         </Text>
         <Text style={styles.version}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#BB86FC', marginBottom: 24, marginTop: 40 },
  section: { marginBottom: 24, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16 },
  sectionTitle: { color: '#888', fontSize: 14, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { color: '#ccc', fontSize: 16 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  button: { 
    backgroundColor: '#03DAC6', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  dangerButton: { backgroundColor: '#CF6679' },
  dangerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  icon: { marginRight: 8 },
  linkButton: { 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  linkText: { color: '#BB86FC', fontSize: 16 },
  footer: { marginTop: 20, alignItems: 'center' },
  disclaimer: { color: '#666', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  version: { color: '#444', fontSize: 12 }
});
