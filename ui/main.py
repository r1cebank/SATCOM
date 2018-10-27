from clock import *
import requests
from guizero import App, Text, Box, PushButton, Window, TextBox, ListBox


class SATCOM:
    def __init__(self):
        self.app = App(title="SATCOM", width=500, height=300, layout="grid")
        self.app.on_close(self.on_close)
        Text(self.app, text="Welcome to SATCOM", grid=[0, 0])
        self.satcom_time = Text(self.app, text="SATCOM Time: UNKNOWN", grid=[1, 0])
        self.satcom_time.text_color = "blue"
        Text(self.app, text="Satelite Connection Status: ", grid=[0, 1])
        self.satelite_status = Text(self.app, text="UNKNOWN", grid=[1, 1])
        self.satelite_status.text_color = "blue"
        Text(self.app, text="Satelite Messages: ", grid=[0, 2])
        self.satelite_msg = Text(self.app, text="0", grid=[1, 2])
        self.satelite_msg.text_color = "blue"
        Text(self.app, text="Current GPS Coordinates: ", grid=[0, 3])
        self.gps = Text(self.app, text="UNKNOWN", grid=[1, 3])
        self.gps.text_color = "blue"
        Text(self.app, text="Temp: ", grid=[0, 4])
        self.temp = Text(self.app, text="UNKNOWN", grid=[1, 4])
        self.temp.text_color = "blue"
        Text(self.app, text="Pressure: ", grid=[0, 5])
        self.pressure = Text(self.app, text="UNKNOWN", grid=[1, 5])
        self.pressure.text_color = "blue"
        Text(self.app, text="Humidity: ", grid=[0, 6])
        self.humidity = Text(self.app, text="UNKNOWN", grid=[1, 6])
        self.humidity.text_color = "blue"
        Text(self.app, text="Altitude: ", grid=[0, 7])
        self.altitude = Text(self.app, text="UNKNOWN", grid=[1, 7])
        self.altitude.text_color = "blue"
        self.send_message_window = Window(self.app, title="Send Message", width=400, height=80, layout="grid")
        Text(self.send_message_window, text="Message: ", grid=[0, 0])
        self.message_box = TextBox(self.send_message_window, width=30 ,grid=[1, 0])
        PushButton(self.send_message_window, text="Send", command=self.send_message, grid=[2, 0])
        self.send_message_window.hide()
        self.messages_window = Window(self.app, title="Messages", width=400, height=300)
        Text(self.messages_window, text="Messages")
        self.message_list = ListBox(self.messages_window)
        self.message_list.width = 40
        self.message_list.height = 15
        self.messages_window.hide()
        PushButton(self.app, text="Send Messages", command=self.show_send_message, grid=[0, 8])
        PushButton(self.app, text="Check Messages", command=self.show_messages, grid=[1, 8])
    def on_close(self):
        self.clock.cancel()
        self.app.destroy()
    def show(self):
        self.clock = clock(1, self.get_data)
        self.app.display()
    def get_data(self):
        resp = requests.get(url="http://localhost:3939/status")
        data = resp.json()
        self.gps.value = "lat: %s lng: %s" % (data['gps']['lat'], data['gps']['lng'])
        if data['gps']['lat'] == 'NOT FIXED':
            self.gps.text_color = "red"
        else:
            self.gps.text_color = "green"
        self.satcom_time.value = "SATCOM Time: %s" % data['satcom']['time']
        self.satelite_status.value = data['satcom']['status']
        if data['satcom']['status'] == 'ACQUIRING':
            self.satelite_status.text_color = "red"
        else:
            self.satelite_status.text_color = "green"
        self.satelite_msg.value = len(data['unread'])
        if len(data['unread']) != 0:
            self.satelite_msg.text_color = "red"
        else:
            self.satelite_msg.text_color = "green"
        self.temp.value = data['sensors']['temperature']
        if data['sensors']['temperature'] == -1:
            self.temp.text_color = "red"
        else:
            self.temp.text_color = "green"
        self.pressure.value = data['sensors']['pressure']
        if data['sensors']['pressure'] == -1:
            self.pressure.text_color = "red"
        else:
            self.pressure.text_color = "green"
        self.humidity.value = data['sensors']['humidity']
        if data['sensors']['humidity'] == -1:
            self.humidity.text_color = "red"
        else:
            self.humidity.text_color = "green"
        self.altitude.value = data['sensors']['altitude']
        if data['sensors']['altitude'] == -1:
            self.altitude.text_color = "red"
        else:
            self.altitude.text_color = "green"

    def send_message(self):
        pass
    def show_send_message(self):
        self.send_message_window.show()
    def show_messages(self):
        self.messages_window.show()

def do_nothing():
    print("Button was pressed")


if __name__ == "__main__":
    SATCOM = SATCOM()
    SATCOM.show()
