# frozen_string_literal: true

require 'nokogiri'
require 'open-uri'
require 'uri'

class PlayerRepository
  PAGE_URL = 'https://www.columbuscrew.com/roster/'

  def all
    parse_players
  end

  def find(id)
    integer_id = Integer(id)
    raise ArgumentError, 'id must be positive' if integer_id <= 0

    all.find { |player| player[:id] == integer_id }
  end

  private

  def parse_players
    page.css('.oc-c-promo').each_with_index.with_object([]) do |(card, index), players|
      name = normalize(card.at_css('.fa-text__title')&.text)
      next if name.empty?

      number_position_text = normalize(card.at_css('.fa-text__body h1')&.text)
      number, position = parse_number_position(number_position_text)

      players << {
        id: index + 1,
        name: name,
        num: number,
        pos: position,
        role: position,
        age: nil,
        birthplace: nil,
        height: nil,
        weight: nil,
        img: find_image_url(card),
        bio_url: absolute_url(card.at_css('a[title="BIO"]')&.[]('href')),
        stats_url: absolute_url(card.at_css('a[title="STATS"]')&.[]('href')),
        source: PAGE_URL
      }
    end
  end

  def page
    @page ||= Nokogiri::HTML(URI.open(PAGE_URL, read_timeout: 15, open_timeout: 15))
  end

  def parse_number_position(text)
    return [nil, nil] if text.empty?

    cleaned = text.gsub('#', '').strip
    number_part, position_part = cleaned.split('-', 2).map { |v| normalize(v) }
    [presence(number_part), presence(position_part)]
  end

  def find_image_url(card)
    image = card.at_css('.fm-card__media img')
    raw = image&.[]('data-src') || image&.[]('src')
    absolute_url(raw)
  end

  def absolute_url(value)
    return nil if value.nil? || value.strip.empty?

    URI.join(PAGE_URL, value.strip).to_s
  rescue URI::InvalidURIError
    nil
  end

  def normalize(value)
    value.to_s.gsub(/\s+/, ' ').strip
  end

  def presence(value)
    normalized = normalize(value)
    normalized.empty? ? nil : normalized
  end
end
