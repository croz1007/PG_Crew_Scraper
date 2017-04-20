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
      all = @@page.css(".player_list .row")

      if all.length > 0
        players = Array.new

        all.each_with_index.map do |player, index|

          if index != 0
            name = player.css(".player_info").css(".name").css("a").text.strip
            num = player.css(".player_info").css(".jersey").text.strip
            pos = player.css(".player_info").css(".position").text.strip
            age = player.css(".player_info").css(".age").text.strip
            birthplace = player.css(".player_info").css(".hometown").text.strip
            height = player.css(".player_info").css(".height").text.strip
            weight = player.css(".player_info").css(".weight").text.strip
            img = player.css(".rounded_image_container").css("a").css(".rounded_image").attr('src')

            player = {id: index, name: name, num: num, pos: pos, age: age, birthplace: birthplace, height: height, weight: weight, img: img}
            players.push(player)

          end
        end
        #players.to_json
        players
      end
  end

end
