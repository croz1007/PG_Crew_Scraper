require 'json'
require 'nokogiri'
require 'open-uri'

class Player

  @@PAGE_URL = 'http://www.columbuscrewsc.com/players'
  @@page = Nokogiri::HTML(open(@@PAGE_URL))

  def initialize
    @players = self.getPlayers
  end

  def all
    @players
  end

  def find id
    index = id.to_i - 1
    @players[index]
  end

  def getPlayers
      all = @@page.css(".views-table tr")

      if all.length > 0
        players = Array.new

        all.each_with_index.map do |player, index|

          if index != 0
            name = player.css(".views-field-field-player-lname-value").css("a").text.strip
            num = player.css(".views-field-field-player-jersey-no-value").text.strip
            pos = player.css(".views-field-field-player-position-detail-value").text.strip
            age = player.css(".views-field-field-player-birth-date-value-1").text.strip
            birthplace = player.css(".views-field-field-player-birth-country-value").text.strip
            height = player.css(".views-field-field-player-height-value").text.strip
            weight = player.css(".views-field-field-player-weight-value").text.strip

            player = {id: index, name: name, num: num, pos: pos, age: age, birthplace: birthplace, height: height, weight: weight}
            players.push(player)

          end
        end
        #players.to_json
        players
      end
  end

end
