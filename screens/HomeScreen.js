import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { theme } from "../theme/index.js";
import { debounce } from "lodash";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { fetchLocations, fetchWeatherForecast } from "../api/weather.js";
import { weatherImages } from "../components/index.js";

export default function HomeScreen() {
  //! inputu gösterme durumunu tutan state
  const [showSearch, setShowSearch] = useState(false);
  //! locasyon verisini tutan state
  const [locations, setLocations] = useState([]);
  //! tıklanan şehrin hava durumu verisini tutan state
  const [weather, setWeather] = useState({});
  //! loading state i
  const [loading, setLoading] = useState(true);

  const closeKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleLocation = (loc) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleSearch = (value) => {
    //! lokasyonları alma
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({
      cityName: "istanbul",
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.jpg")}
        className="absolute w-full h-full"
      />

      {loading ? (
        <View className="flex-1 justify-center items-center space-y-4">
          <ActivityIndicator size={"large"} />
          <Text className="text-white text-4xl font-bold tracking-widest">
            Loading...
          </Text>
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {/* arama input kısmı */}
          <View style={{ height: "7%" }} className="mx-4 relative z-50 mt-2">
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Şehir Ara"
                  placeholderTextColor={"lightgray"}
                  className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((loc, i) => {
                  let showBorder = i + 1 != locations.length;
                  let borderClass = showBorder
                    ? " border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={i}
                      className={`flex-row items-center border-0 p-3 px-4 mb-1 ${borderClass}`}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text className="text-black text-lg ml-2 font-bold">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* tahmin bölümü */}
          <View className="mx-4 flex justify-around flex-1 mb-2">
            {/* lokasyon kısmı */}
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg font-semibold text-gray-300">
                {" " + location?.country}
              </Text>
            </Text>
            {/* hava resmi */}
            <View className="flex-row justify-center">
              <Image
                source={
                  weatherImages[current?.condition?.text.toLowerCase().trim()]
                }
                className="w-52 h-52"
              />
            </View>
            {/* derece kısmı */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>
            {/* diğer istatistikler */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/images/wind.png")}
                  className="h-10 w-10"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/images/drop.png")}
                  className="h-10 w-10"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/images/sun.png")}
                  className="h-10 w-10"
                />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* günlük tahmin */}
          <View className="mb-4 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className="text-white text-base">Daily Forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];
                return (
                  <View
                    key={index}
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                  >
                    <Text className="text-white">{dayName}</Text>
                    <Image
                      source={
                        weatherImages[
                          item?.day?.condition?.text.toLowerCase().trim()
                        ]
                      }
                      className="h-11 w-11"
                    />
                    <Text className="text-white text-xl font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
