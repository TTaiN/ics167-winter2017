CC = g++
CFLAGS = -c -std=c++11
LDFLAGS =
SOURCES = main.cpp websocket.cpp sha1.cpp base64.cpp json11.cpp gamestate.cpp gamelogic.cpp
OBJECTS = $(SOURCES:.cpp=.o)
EXECUTABLE = ics167group2server

all: $(SOURCES) $(EXECUTABLE)
	
$(EXECUTABLE): $(OBJECTS) 
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.cpp.o:
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf *o $(EXECUTABLE)
