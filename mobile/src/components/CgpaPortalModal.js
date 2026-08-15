import { useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/useTheme';

// The real GGSIPU results portal — login is Enrollment Number + Father's
// Name (in capitals), per the university's own instructions. You log in
// here directly with GGSIPU; nothing you type is ever seen by this app or
// sent anywhere else, because this is GGSIPU's own page rendered in a
// sandboxed browser, not a form this app collects.
const PORTAL_URL = 'https://examweb.ggsipu.ac.in/web/login.jsp';

// Runs inside the portal's own page (not this app's JS context) — pulls
// every table's text plus any "CGPA"/"SGPA"-adjacent numbers it can find,
// and hands it back. This is a generic, best-effort scrape: the exact page
// layout isn't something that could be verified against the real portal
// while building this (the server refuses connections from outside India),
// so it's built to surface raw content for you to read, not to claim exact
// field-by-field parsing it can't back up.
const EXTRACT_SCRIPT = `
(function () {
  try {
    const tables = Array.from(document.querySelectorAll('table')).map((table) =>
      Array.from(table.querySelectorAll('tr')).map((row) =>
        Array.from(row.querySelectorAll('td,th')).map((cell) => cell.innerText.trim())
      )
    ).filter((t) => t.length > 0);

    const bodyText = document.body.innerText || '';
    const cgpaMatches = Array.from(bodyText.matchAll(/(CGPA|SGPA)[^\\d]{0,10}(\\d+(\\.\\d+)?)/gi)).map((m) => m[0]);

    window.ReactNativeWebView.postMessage(JSON.stringify({ tables, cgpaMatches }));
  } catch (e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ error: String(e) }));
  }
  true;
})();
`;

export default function CgpaPortalModal({ open, onClose, onSave }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const webviewRef = useRef(null);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);

  function handleClose() {
    setExtracted(null);
    setError(null);
    onClose();
  }

  function handleExtract() {
    setError(null);
    webviewRef.current?.injectJavaScript(EXTRACT_SCRIPT);
  }

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) {
        setError("Couldn't read this page — try navigating to your results/marks page first.");
        return;
      }
      if (data.tables.length === 0 && data.cgpaMatches.length === 0) {
        setError("Nothing table-like found on this page — navigate to your results page, then tap Extract again.");
        return;
      }
      setExtracted(data);
    } catch {
      setError('Something went wrong reading that page.');
    }
  }

  return (
    <Modal visible={open} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-outline-variant">
          <Text className="text-lg font-medium text-on-surface" numberOfLines={1}>GGSIPU results portal</Text>
          <TouchableOpacity onPress={handleClose} className="w-11 h-11 items-center justify-center rounded-full">
            <MaterialIcons name="close" size={20} color={colors.onSurfaceSecondary} />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-2.5 bg-g-blue-container">
          <Text className="text-xs text-g-blue-dark">
            Log in with your Enrollment Number and Father's Name (GGSIPU's own login) below, navigate to your
            results, then tap Extract. Nothing you type here is seen by this app.
          </Text>
        </View>

        {!extracted ? (
          <>
            <WebView
              ref={webviewRef}
              source={{ uri: PORTAL_URL }}
              onMessage={handleMessage}
              style={{ flex: 1 }}
            />
            {error && (
              <View className="px-5 py-2 bg-g-red-container">
                <Text className="text-xs text-g-red-dark">{error}</Text>
              </View>
            )}
            <View className="px-5 py-3 border-t border-outline-variant" style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
              <TouchableOpacity onPress={handleExtract} className="bg-g-blue rounded-full py-3.5 items-center flex-row justify-center gap-2">
                <MaterialIcons name="content-copy" size={18} color="#FFFFFF" />
                <Text className="text-white font-medium">Extract from this page</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
              {extracted.cgpaMatches.length > 0 && (
                <View className="mb-4">
                  <Text className="text-xs font-semibold text-on-surface-tertiary uppercase mb-2">Detected CGPA/SGPA mentions</Text>
                  {extracted.cgpaMatches.map((m, i) => (
                    <Text key={i} className="text-sm font-medium text-on-surface mb-1">{m}</Text>
                  ))}
                </View>
              )}
              {extracted.tables.map((table, ti) => (
                <View key={ti} className="mb-4">
                  <Text className="text-xs font-semibold text-on-surface-tertiary uppercase mb-2">Table {ti + 1}</Text>
                  {table.map((row, ri) => (
                    <Text key={ri} className="text-xs text-on-surface mb-1">{row.join(' · ')}</Text>
                  ))}
                </View>
              ))}
              <Text className="text-xs text-on-surface-tertiary mt-2">
                This is a raw, best-effort read of the page — double-check these numbers against what's shown on the
                portal, then enter your semester/subject marks on the GPA screen as usual.
              </Text>
            </ScrollView>
            <View className="px-5 py-3 border-t border-outline-variant" style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
              <TouchableOpacity onPress={() => setExtracted(null)} className="rounded-full py-3.5 items-center border border-outline-variant mb-2">
                <Text className="font-medium text-on-surface-secondary">Back to portal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onSave?.(extracted);
                  handleClose();
                }}
                className="bg-g-blue rounded-full py-3.5 items-center"
              >
                <Text className="text-white font-medium">Save snapshot & close</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
