from guizero import App, Text, Box, PushButton, Window, TextBox, ListBox

def do_nothing():
    print("Button was pressed")

app = App(title="SATCOM", width=400, height=300, layout="grid")

title = Text(app, text="Welcome to SATCOM", grid=[0, 0])

satelite_label = Text(app, text="Satelite Connection Status: ", grid=[0, 1])
satelite_status = Text(app, text="UNKNOWN", grid=[1, 1])
satelite_status.text_color = "red"

satelite_msg_label = Text(app, text="Satelite Messages: ", grid=[0, 2])
satelite_msg = Text(app, text="0", grid=[1, 2])

gps_label = Text(app, text="Current GPS Coordinates: ", grid=[0, 3])
gps = Text(app, text="41°24'12.2\"N 2°10'26.5\"E", grid=[1, 3])
gps.text_color = "green"

co2_label = Text(app, text="eCO2 Concentration: ", grid=[0, 4])
co2 = Text(app, text="20,000 ppm", grid=[1, 4])
co2.text_color = "green"

tvoc_label = Text(app, text="TVOC Concentration: ", grid=[0, 5])
tvoc = Text(app, text="20,000 ppb", grid=[1, 5])
tvoc.text_color = "blue"

temp_label = Text(app, text="Temp: ", grid=[0, 6])
temp = Text(app, text="50 F", grid=[1, 6])
temp.text_color = "green"

humidity_label = Text(app, text="Humidity: ", grid=[0, 7])
humidity = Text(app, text="60%", grid=[1, 7])
humidity.text_color = "green"

baro_label = Text(app, text="Pressure: ", grid=[0, 8])
baro = Text(app, text="100 hpa", grid=[1, 8])
baro.text_color = "green"

sendMessageWindow = Window(app, title="Send Message", width=400, height=80, layout="grid")
message_label = Text(sendMessageWindow, text="Message: ", grid=[0, 0])
message_Box = TextBox(sendMessageWindow, width=30 ,grid=[1, 0])
send_btn = PushButton(sendMessageWindow, text="Send", command=do_nothing, grid=[2, 0])

sendMessageWindow.hide()

messagesWindow = Window(app, title="Messages", width=400, height=300)
message_label = Text(messagesWindow, text="Messages")
message_Box = ListBox(messagesWindow)
message_Box.width = 40
message_Box.height = 15
messagesWindow.hide()


def show_sendMessage():
    sendMessageWindow.show()
def show_messages():
    messagesWindow.show()

send_message_btn = PushButton(app, text="Send Messages", command=show_sendMessage, grid=[0, 9])
check_message_btn = PushButton(app, text="Check Messages", command=show_messages, grid=[1, 9])

app.display()
