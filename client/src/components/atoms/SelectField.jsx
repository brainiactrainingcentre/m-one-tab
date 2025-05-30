import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

const SelectField = ({ label, value, onValueChange, items, error }) => {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 mb-1">{label}</Text>
      <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={{ color: "#374151" }} // Tailwind 'text-gray-700'
        >
          <Picker.Item label="Select an option" value="" />
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
      {error && <Text className="text-red-500 mt-1">{error}</Text>}
    </View>
  );
};

export default SelectField;
