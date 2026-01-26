import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { FC, memo, useEffect, useState } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";

interface IRadio {
  title: string;
  selected: boolean;
  onPress: () => void;
}

const Radio: FC<IRadio> = ({ title, selected, onPress }) => {
  const [radioSelected, setRadioSelected] = useState(selected);

  useEffect(() => {
    setRadioSelected(selected);
  }, [selected]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.outerCircle} onPress={onPress}>
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: radioSelected
                ? AppColors.black
                : AppColors.white,
            },
          ]}
        ></View>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Radio;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: s(10),
    margin: 10,
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  outerCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderColor: AppColors.black,
    borderWidth: 2,
    borderRadius: 8,
  },
  title: {
    fontFamily: AppFonts.Medium,
    fontSize: s(15),
  },
});
